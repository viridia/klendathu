import { Context } from './Context';
import {
  AccountRecord,
  IssueLinkRecord,
  TimelineEntryRecord,
  IssueRecord,
  CustomValues,
  CustomData,
  ProjectRecord,
} from '../db/types';
import {
  NewIssueMutationArgs,
  UpdateIssueMutationArgs,
  DeleteIssueMutationArgs,
  CustomFieldInput,
  ChangeAction,
  CustomFieldChange,
  Relation,
  AddCommentMutationArgs,
} from '../../../common/types/graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role, inverseRelations } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID, UpdateQuery } from 'mongodb';
import { Channels, publish } from './pubsub';

function customArrayToMap(custom: CustomFieldInput[]): CustomValues {
  const result: CustomValues = {};
  custom.forEach(({ key, value }) => { if (value !== null) { result[key] = value; } });
  return result;
}

const strToId = (s: string): ObjectID => new ObjectID(s);

const COALESCE_WINDOW = 10 * 60 * 1000; // Ten minutes

export const mutations = {
  async newIssue(
      _: any,
      { project, input }: NewIssueMutationArgs,
      context: Context): Promise<IssueRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const issues = context.db.collection<IssueRecord>('issues');
    const projects = context.db.collection<ProjectRecord>('projects');
    const timeline = context.db.collection<TimelineEntryRecord>('timeline');
    const { project: pr, role } =
        await getProjectAndRole(context.db, context.user, new ObjectID(project));
    if (!project) {
      logger.error('Attempt add issue to non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.REPORTER) {
      logger.error('Insufficient permissions to create issue:', { user, project });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // Compute next issue id.
    const p = await projects.findOneAndUpdate(
      { _id: pr._id },
      { $inc: { issueIdCounter: 1 } });

    const now = new Date();
    const record: IssueRecord = {
      _id: `${pr._id}.${p.value.issueIdCounter}`,
      project: pr._id,
      type: input.type,
      state: input.state,
      summary: input.summary,
      description: input.description || '',
      reporter: context.user._id,
      reporterSort: context.user.accountName,
      owner: undefined,
      ownerSort: '',
      created: now,
      updated: now,
      cc: (input.cc || []).map(id => new ObjectID(id)),
      labels: (input.labels || []),
      custom: input.custom ? customArrayToMap(input.custom) : {},
      attachments: input.attachments || [],
      isPublic: !!input.isPublic,
    };

    if (input.owner) {
      if (context.user._id.equals(input.owner)) {
        record.owner = context.user._id;
        record.ownerSort = context.user.accountName;
      } else {
        const owner = await context.db.collection('accounts')
          .findOne<AccountRecord>({ _id: new ObjectID(input.owner) });
        if (!owner) {
          throw new UserInputError(Errors.NOT_FOUND, { field: 'owner' });
        }
        record.owner = owner._id;
        record.ownerSort = owner.accountName;
      }
    }

    const timelineRecordsToInsert: TimelineEntryRecord[] = (input.comments || []).map(comment => ({
      issue: record._id,
      project: pr._id,
      by: context.user._id,
      commentBody: comment,
      at: now,
      updated: now,
    }));

    const result = await issues.insertOne(record);
    const row: IssueRecord = result.ops[0];
    const linkedIssuesToUpdate: IssueRecord[] = [];
    if (result.insertedCount === 1) {
      if (input.linked && input.linked.length > 0) {
        const linksToInsert: IssueLinkRecord[] = [];
        for (const link of input.linked) {
          const target = await issues.findOne({ _id: new ObjectID(link.to) });
          if (target) {
            linksToInsert.push({
              from: row._id,
              to: target._id,
              relation: link.relation,
            });
            // TODO: Load the target record and make a change for it.
            // Create a change record for the issue we are linking to.
            const inv = inverseRelations[link.relation];
            timelineRecordsToInsert.push({
              issue: target._id,
              project: pr._id,
              by: context.user._id,
              at: now,
              linked: [{ to: row._id, after: inv }],
            });
            linkedIssuesToUpdate.push(target);
          }
        }
        await context.db.collection('issueLinks').insertMany(linksToInsert);
      }

      if (timelineRecordsToInsert.length > 0) {
        const res = await timeline.insertMany(timelineRecordsToInsert);
        res.ops.forEach(changeRow => {
          publish(Channels.TIMELINE_CHANGE, {
            action: ChangeAction.Added,
            value: changeRow,
          });
        });
      }
    }

    // Notify this issue was added
    publish(Channels.ISSUE_CHANGE, {
      action: ChangeAction.Added,
      value: row,
    });

    // Notify issues we linked to were changed
    linkedIssuesToUpdate.forEach(iss => {
      publish(Channels.ISSUE_CHANGE, {
        action: ChangeAction.Changed,
        value: iss,
      });
    });
    return row;
  },

  async updateIssue(
      _: any,
      { id, input }: UpdateIssueMutationArgs,
      context: Context): Promise<IssueRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;

    const issues = context.db.collection<IssueRecord>('issues');
    const issueLinks = context.db.collection<IssueLinkRecord>('issueLinks');
    const timeline = context.db.collection<TimelineEntryRecord>('timeline');
    const issue = await issues.findOne({ _id: id });
    if (!issue) {
      logger.error('Attempt to update non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, issue.project);
    if (!project) {
      logger.error('Attempt to update non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to update project:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // Ensure that all of the issues we are linking to actually exist.
    if (input.linked) {
      const linkedIssueIds = new Set(input.linked.map(link => link.to));
      const linkedIssues = await issues
          .find({ _id: { $in: Array.from(linkedIssueIds) } }).toArray();
      for (const link of linkedIssues) {
        linkedIssueIds.delete(link._id);
      }
      if (linkedIssueIds.size > 0) {
        logger.error(
            'Attempt to link to non-existent issue:',
            { user, id, links: Array.from(linkedIssueIds) });
        throw new UserInputError(Errors.INVALID_LINK);
      }
    }

    // TODO: ensure ccs are valid
    // TODO: ensure labels are valid
    // TODO: ensure attachments are valid

    const now = new Date();
    const update: any = {
      $set: {
        updated: now,
      },
    };
    const timelineRecordsToInsert: TimelineEntryRecord[] = [];
    const promises: Array<Promise<any>> = [];

    const change: TimelineEntryRecord = {
      project: project._id,
      issue: issue._id,
      by: context.user._id,
      at: null, // 'at' is also used as a marker to indicate that this record needs to be updated.
    };

    // Change type
    if ('type' in input && input.type !== issue.type) {
      update.$set.type = input.type;
      change.type = { before: issue.type, after: input.type };
      change.at = now;
    }

    // Change state
    if ('state' in input && input.state !== issue.state) {
      update.$set.state = input.state;
      change.state = { before: issue.state, after: input.state };
      change.at = now;
    }

    if ('summary' in input && input.summary !== issue.summary) {
      update.$set.summary = input.summary;
      change.summary = { before: issue.summary, after: input.summary };
      change.at = now;
    }

    if ('description' in input && input.description !== issue.description) {
      update.$set.description = input.description;
      change.description = { before: issue.description, after: input.description };
      change.at = now;
    }

    // TODO: Implement
    // if ('milestone' in input && input.milestone !== issue.milestone) {
    //   record.milestone = input.milestone;
    //   change.milestone = { before: issue.milestone, after: input.milestone };
    //   change.at = record.updated;
    // }

    if ('owner' in input) {
      let ownerRecord: AccountRecord = null;
      if (input.owner) {
        ownerRecord = await context.db.collection<AccountRecord>('accounts')
            .findOne({ _id: new ObjectID(input.owner) });
        if (!ownerRecord) {
          logger.error(
            'Attempt to set non-existent owner:',
            { user, id, owner: input.owner });
          throw new UserInputError(Errors.NOT_FOUND);
        }
      }

      if (ownerRecord) {
        if (!ownerRecord._id.equals(issue.owner)) {
          update.$set.owner = ownerRecord._id;
          update.$set.ownerSort = ownerRecord.accountName;
          change.owner = { before: issue.owner, after: new ObjectID(input.owner) };
          change.at = now;
        }
      } else if (!input.owner) {
        update.$set.owner = null;
        update.$set.ownerSort = null;
        change.owner = { before: issue.owner, after: null };
        change.at = now;
      }
    }

    if ('cc' in input) {
      const ccPrev = new Set(issue.cc.map(cc => cc.toHexString())); // Removed items
      const ccNext = new Set(input.cc);    // Newly-added items
      input.cc.forEach(cc => ccPrev.delete(cc));
      issue.cc.forEach(cc => ccNext.delete(cc.toHexString()));
      update.$set.cc = input.cc.map(strToId);
      if (ccNext.size > 0 || ccPrev.size > 0) {
        change.cc = {
          added: Array.from(ccNext.keys()).map(strToId),
          removed: Array.from(ccPrev).map(strToId),
        };
        change.at = now;
      }
    } else if ('addCC' in input || 'removeCC' in input) {
      const ccPrev = new Set(issue.cc.map(cc => cc.toHexString()));
      const ccToAdd = new Set(input.addCC || []);
      const ccAdded: ObjectID[] = [];
      const ccRemoved: ObjectID[] = [];
      for (const cc of ccToAdd) {
        if (cc && !ccPrev.has(cc)) {
          ccPrev.add(cc);
          ccAdded.push(strToId(cc));
        }
      }

      for (const cc of (input.removeCC || [])) {
        if (cc && ccPrev.has(cc) && !ccToAdd.has(cc)) {
          ccPrev.delete(cc);
          ccRemoved.push(strToId(cc));
        }
      }

      if (ccAdded.length > 0 || ccRemoved.length > 0) {
        change.cc = {
          added: ccAdded,
          removed: ccRemoved,
        };
        change.at = now;
        if (ccAdded.length > 0) {
          if (!update.$addToSet) {
            update.$addToSet = {};
          }
          update.$addToSet.cc = { $each: ccAdded };
        }
        if (ccRemoved.length > 0) {
          if (!update.$pullAll) {
            update.$pullAll = {};
          }
          update.$pullAll.cc = ccRemoved;
        }
      }
    }

    if ('labels' in input) {
      const labelsPrev = new Set(issue.labels);    // Current labels
      const labelsNext = new Set(input.labels);    // Newly-added items
      input.labels.forEach(labels => labelsPrev.delete(labels));
      issue.labels.forEach(labels => labelsNext.delete(labels));
      update.$set.labels = input.labels;
      if (labelsNext.size > 0 || labelsPrev.size > 0) {
        change.labels = {
          added: Array.from(labelsNext),
          removed: Array.from(labelsPrev),
        };
        change.at = now;
      }
    } else if ('addLabels' in input || 'removeLabels' in input) {
      const labelsPrev = new Set(issue.labels);
      const labelsToAdd = new Set(input.addLabels || []);
      const labelsAdded: string[] = [];
      const labelsRemoved: string[] = [];
      for (const label of labelsToAdd) {
        if (!labelsPrev.has(label)) {
          labelsPrev.add(label);
          labelsAdded.push(label);
        }
      }

      for (const label of (input.removeLabels || [])) {
        if (labelsPrev.has(label) && !labelsToAdd.has(label)) {
          labelsPrev.delete(label);
          labelsRemoved.push(label);
        }
      }

      if (labelsAdded.length > 0 || labelsRemoved.length > 0) {
        change.labels = {
          added: labelsAdded,
          removed: labelsRemoved,
        };
        change.at = now;
        if (labelsAdded.length > 0) {
          if (!update.$addToSet) {
            update.$addToSet = {};
          }
          update.$addToSet.labels = { $each: labelsAdded };
        }
        if (labelsRemoved.length > 0) {
          if (!update.$pullAll) {
            update.$pullAll = {};
          }
          update.$pullAll.labels = labelsRemoved;
        }
      }
    }

    if ('custom' in input) {
      update.$set.custom = customArrayToMap(input.custom);
      const customPrev = new Map<string, CustomData>();
      const customNext = new Map<string, CustomData>();
      const customChange: CustomFieldChange[] = [];
      for (const key of Object.getOwnPropertyNames(issue.custom)) {
        const value = issue.custom[key];
        if (value !== null && value !== undefined) {
          customPrev.set(key, issue.custom[key]);
        }
      }
      for (const entry of input.custom) {
        if (entry.value !== null && entry.value !== undefined) {
          customNext.set(entry.key, entry.value);
        }
      }
      customNext.forEach((value, key) => {
        if (customPrev.has(key)) {
          const before = customPrev.get(key);
          if (value !== before) {
            // A changed value
            customChange.push({ key, before, after: value });
          }
        } else {
          // A newly-added value
          customChange.push({ key, after: value });
        }
      });
      customPrev.forEach((value, key) => {
        if (!customNext.has(key)) {
          // A deleted value
          customChange.push({ key, before: value });
        }
      });

      if (customChange.length > 0) {
        change.custom = customChange;
        change.at = now;
      }
    }

    // TODO: Implement
    // if ('attachments' in input) {
    //   const existingAttachments = issue.attachments || [];
    //   record.attachments = input.attachments;
    //   const attachmentsPrev = new Set(existingAttachments);
    //   const attachmentsNext = new Set(input.attachments);
    //   input.attachments.forEach(attachments => attachmentsPrev.delete(attachments));
    //   existingAttachments.forEach(attachments => attachmentsNext.delete(attachments));
    //   if (attachmentsNext.size > 0 || attachmentsPrev.size > 0) {
    //     change.attachments = {
    //       added: Array.from(attachmentsNext),
    //       removed: Array.from(attachmentsPrev),
    //     };
    //     change.at = record.updated;
    //   }
    // }

    // Patch comments list.
    if ('comments' in input) {
      for (const c of input.comments) {
        if (change.commentBody === undefined) {
          // Combine the first comment with the change record
          change.commentBody = c;
          change.at = now;
        } else {
          timelineRecordsToInsert.push({
            project: project._id,
            issue: issue._id,
            by: context.user._id,
            at: now,
            commentBody: c,
          });
        }
      }
    }

    if ('linked' in input || 'addLinks' in input || 'removeLinks' in input) {
      // Find all links referencing this issue
      const links = await issueLinks.find({
        $or: [
          { from: issue._id },
          { to: issue._id },
        ]
      }).toArray();
      const linksToInsert: IssueLinkRecord[] = [];
      const linksToRemove: IssueLinkRecord[] = [];
      const linksToUpdate: IssueLinkRecord[] = [];

      // Change records for the other side of the link.
      const addChangeRecord = (iss: string, ch: { before?: Relation, after?: Relation }) => {
        timelineRecordsToInsert.push({
          project: project._id,
          by: context.user._id,
          issue: iss,
          at: now,
          linked: [{ to: issue._id, ...ch }],
        });
      };

      // Links from this issue to another issue, indexed by target
      const fwdMap = new Map<string, IssueLinkRecord>(links
          .filter(link => link.from === issue._id)
          .map(link => [link.to, link] as [string, IssueLinkRecord]));
      // Links to this issue from another issue, indexed by source
      const rvsMap = new Map<string, IssueLinkRecord>(links
          .filter(link => link.to === issue._id)
          .map(link => [link.from, link] as [string, IssueLinkRecord]));
      change.linked = [];

      if ('linked' in input) {
        // Replace list
        for (const link of input.linked) {
          const inv = inverseRelations[link.relation]; // Inverse relation
          const fwd = fwdMap.get(link.to); // Pre-existing link from this to another issue.
          const rvs = rvsMap.get(link.to); // Pre-existing link from another issue to this.

          if (!fwd && !rvs) {
            // This is a new link (no link between current issue and link.to)
            linksToInsert.push({ from: issue._id, to: link.to, relation: link.relation });
            change.linked.push({ to: link.to, after: link.relation });
            addChangeRecord(link.to, { after: inv });
          } else if (fwd) {
            // Existing forward link, see if the relationship changed
            if (fwd.relation !== link.relation) {
              linksToUpdate.push({ ...fwd, relation: link.relation });
              change.linked.push({ to: link.to, before: fwd.relation, after: link.relation });
              addChangeRecord(link.to, { before: inverseRelations[fwd.relation], after: inv });
            }
          } else if (rvs) {
            // Existing reverse link, see if the (inverse) relationship changed.
            if (rvs.relation !== inv) {
              linksToUpdate.push({ ...rvs, relation: inv });
              change.linked.push({
                  to: link.to, before: inverseRelations[rvs.relation], after: inv });
              addChangeRecord(rvs.from, { before: rvs.relation, after: link.relation });
            }
          }
        }

        // Remove any entries from the maps that were maintained
        for (const link of input.linked) {
          fwdMap.delete(link.to);
          rvsMap.delete(link.to);
        }

        // Delete all forward links that weren't in the list
        for (const fwd of fwdMap.values()) {
          // Queue link for deletion
          linksToRemove.push(fwd);
          change.linked.push({ to: fwd.to, before: fwd.relation });
          addChangeRecord(fwd.to, { before: inverseRelations[fwd.relation] });
        }

        // Delete all reverse links that weren't in the list
        for (const rvs of rvsMap.values()) {
          // Queue link for deletion
          linksToRemove.push(rvs);
          change.linked.push({ to: rvs.from, before: inverseRelations[rvs.relation] });
          addChangeRecord(rvs.from, { before: rvs.relation });
        }
      }

      if ('addLinks' in input) {
        for (const link of input.addLinks) {
          const inv = inverseRelations[link.relation]; // Inverse relation
          const fwd = fwdMap.get(link.to); // Pre-existing link from this to another issue.
          const rvs = rvsMap.get(link.to); // Pre-existing link from another issue to this.

          if (!fwd && !rvs) {
            // This is a new link (no link between current issue and link.to)
            linksToInsert.push({ from: issue._id, to: link.to, relation: link.relation });
            change.linked.push({ to: link.to, after: link.relation });
            addChangeRecord(link.to, { after: inv });
          } else if (fwd) {
            // Existing forward link, see if the relationship changed
            if (fwd.relation !== link.relation) {
              linksToUpdate.push({ ...fwd, relation: link.relation });
              change.linked.push({ to: link.to, before: fwd.relation, after: link.relation });
              addChangeRecord(link.to, { before: inverseRelations[fwd.relation], after: inv });
            }
          } else if (rvs) {
            // Existing reverse link, see if the (inverse) relationship changed.
            if (rvs.relation !== inv) {
              linksToUpdate.push({ ...rvs, relation: inv });
              change.linked.push({
                  to: link.to, before: inverseRelations[rvs.relation], after: inv });
              addChangeRecord(rvs.from, { before: rvs.relation, after: link.relation });
            }
          }
        }

        // Unlike 'linked' case above, we don't remove any links.
      }

      if ('removeLinks' in input) {
        for (const linkId of input.removeLinks) {
          const fwd = fwdMap.get(linkId); // Pre-existing link from this to another issue.
          const rvs = rvsMap.get(linkId); // Pre-existing link from another issue to this.

          if (fwd) {
            linksToRemove.push(fwd);
            change.linked.push({ to: fwd.to, before: fwd.relation });
            addChangeRecord(fwd.to, { before: inverseRelations[fwd.relation] });
          } else if (rvs) {
            // Existing reverse link, see if the (inverse) relationship changed.
            linksToRemove.push(rvs);
            change.linked.push({ to: rvs.from, before: inverseRelations[rvs.relation] });
            addChangeRecord(rvs.from, { before: rvs.relation });
          }
        }
      }

      if (change.linked.length > 0) {
        change.at = now;
      }

      if (linksToInsert.length > 0) {
        promises.push(issueLinks.insertMany(linksToInsert));
      }
      if (linksToRemove.length > 0) {
        promises.push(issueLinks.deleteMany({ _id: { $in: linksToRemove.map(lnk => lnk._id) } }));
      }
      if (linksToUpdate.length > 0) {
        for (const lnk of linksToUpdate) {
          promises.push(issueLinks.findOneAndReplace({ _id: lnk._id }, lnk));
        }
      }
    }

    // Mutate the issue record.
    let returnValue: IssueRecord = issue;
    if (change.at) {
      const result = await issues.findOneAndUpdate({ _id: issue._id }, update, {
        returnOriginal: false,
      });
      returnValue = result.value;
    }

    // Update the timeline records
    if (change.at) {
      // See if we can coalesce with a recent change
      const recentChanges = await timeline.find({
        project: project._id,
        issue: issue._id,
        by: change.by,
        at: { $gt: new Date(now.getTime() - COALESCE_WINDOW) },
      }).sort({ at: -1 }).limit(1).toArray();
      let coalesced = false;
      if (recentChanges.length > 0) {
        const recent = recentChanges[0];
        // Cannot coalesce comment bodies
        if (!(recent.commentBody && change.commentBody)) {
          const updateRecent: UpdateQuery<TimelineEntryRecord> = {
            $set: { at: change.at },
          };
          // Merge property changes.
          if (change.type) {
            updateRecent.$set.type = {
              before: recent.type ? recent.type.before : change.type.before,
              after: change.type.after,
            };
          }
          if (change.state) {
            updateRecent.$set.state = {
              before: recent.state ? recent.state.before : change.state.before,
              after: change.state.after,
            };
          }
          if (change.summary) {
            updateRecent.$set.summary = {
              before: recent.summary ? recent.summary.before : change.summary.before,
              after: change.summary.after,
            };
          }
          if (change.description) {
            updateRecent.$set.description = {
              before: recent.description ? recent.description.before : change.description.before,
              after: change.description.after,
            };
          }
          if (change.owner) {
            updateRecent.$set.owner = {
              before: recent.owner ? recent.owner.before : change.owner.before,
              after: change.owner.after,
            };
          }
          if (change.cc) {
            updateRecent.$set.cc = {
              added: [...(recent.cc ? recent.cc.added : []), ...change.cc.added],
              removed: [...(recent.cc ? recent.cc.removed : []), ...change.cc.removed],
            };
          }
          if (change.labels) {
            updateRecent.$set.labels = {
              added: [...(recent.labels ? recent.labels.added : []), ...change.labels.added],
              removed: [...(recent.labels ? recent.labels.removed : []), ...change.labels.removed],
            };
          }

          if (change.custom) {
            updateRecent.$set.custom = [...(recent.custom || []), ...change.custom];
          }

          if (change.linked) {
            updateRecent.$set.linked = [...(recent.linked || []), ...change.linked];
          }

          // TODO:
          // milestone?: StringChange;
          // attachments?: {
          //   added?: string[];
          //   removed?: string[];
          // };
          // commentUpdated?: Date;
          // commentRemoved?: Date;

          const chgRes = await timeline.findOneAndUpdate({ _id: recent._id }, updateRecent, {
            returnOriginal: false,
          });
          coalesced = !!chgRes.ok;
          if (coalesced) {
            publish(Channels.TIMELINE_CHANGE, {
              action: ChangeAction.Added,
              value: chgRes.value,
            });
          }
        }
      }

      // If we didn't coalesce, then add a new timeline entry.
      if (!coalesced) {
        timelineRecordsToInsert.push(change);
      }
    }

    await Promise.all(promises);

    if (timelineRecordsToInsert.length > 0) {
      const timelineResults = await timeline.insertMany(timelineRecordsToInsert);
      timelineResults.ops.forEach(changeRow => {
        publish(Channels.TIMELINE_CHANGE, {
          action: ChangeAction.Added,
          value: changeRow,
        });
      });
    }

    // The issue record didn't change, but the timeline might have.
    publish(Channels.ISSUE_CHANGE, {
      action: ChangeAction.Changed,
      value: issue,
    });
    return returnValue;
  },

  async deleteIssue(
      _: any,
      { id }: DeleteIssueMutationArgs,
      context: Context): Promise<IssueRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;

    const issue = await context.db.collection('issues').findOne<IssueRecord>({ _id: id });
    if (!issue) {
      logger.error('Attempt to delete non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, new ObjectID(id));
    if (!project) {
      logger.error('Attempt to update non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to update project:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    return null;
  },

  // "Add a comment to an issue."
  // addComment(id: ID!, body: String!): TimelineEntry!
  async addComment(
      _: any,
      { id, body }: AddCommentMutationArgs,
      context: Context): Promise<TimelineEntryRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;
    const issues = context.db.collection<IssueRecord>('issues');
    const timeline = context.db.collection<TimelineEntryRecord>('timeline');
    const issue = await issues.findOne({ _id: id });
    if (!issue) {
      logger.error('Attempt to comment on non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, issue.project);
    if (!project) {
      logger.error('Attempt to comment on non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.REPORTER) {
      logger.error('Insufficient permissions to comment on:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const now = new Date();
    const record: TimelineEntryRecord = {
      project: project._id,
      issue: issue._id,
      by: context.user._id,
      at: now,
      commentBody: body,
    };

    const result = await timeline.insertOne(record);
    publish(Channels.TIMELINE_CHANGE, {
      action: ChangeAction.Added,
      value: result.ops[0],
    });
    return result.ops[0];
  },
};
