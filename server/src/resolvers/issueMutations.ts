import { Context } from './Context';
import {
  AccountRecord,
  IssueLinkRecord,
  TimelineEntryRecord,
  IssueRecord,
  CustomValues,
  CustomData,
  TimeboxRecord,
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
  AttachmentInput,
  IssueLinkInput,
} from '../../../common/types/graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role, inverseRelations } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { Channels, publish } from './pubsub';
import { Attachment } from '../db/types/IssueRecord';
import { escapeRegExp } from '../db/helpers';
import { updateIssueLinks } from '../db/links';

function customArrayToMap(custom: CustomFieldInput[]): CustomValues {
  const result: CustomValues = {};
  custom.forEach(({ key, value }) => { if (value !== null) { result[key] = value; } });
  return result;
}

function attachmentInputToAttachment(input: AttachmentInput): Attachment {
  const { id, ...props } = input;
  return { id: new ObjectID(id), ...props };
}

const BASE_URL = escapeRegExp(process.env.PUBLIC_URL || '');
const LINK_RE = new RegExp(
  `^:([\\-_A-Za-z0-9\\s]+)(?:#(\\d+)|${BASE_URL}/([\\w_\\-\\.]+)/([\\w_\\-\\.]+)/(\\d+))`, 'mg'); // eslint-disable-line

const LinkDirectives: { [key: string]: Relation } = {
  'blocked by': Relation.BlockedBy,
  blocks: Relation.Blocks,
  'part of': Relation.PartOf,
  'subtask of': Relation.PartOf,
  contains: Relation.HasPart,
  duplicate: Relation.Duplicate,
  dup: Relation.Duplicate,
  related: Relation.Related,
};

export function scanForDirectives(
    accountName: string,
    projectName: string,
    projectId: ObjectID | string,
    comments: string[],
    links: IssueLinkInput[]) {
  if (!BASE_URL) {
    return;
  }
  const re = new RegExp(LINK_RE);
  for (const comment of comments) {
    for (;;) {
      const m = re.exec(comment);
      if (m) {
        const [, directive, id, account, project, issue] = m;
        const dir = directive.trimRight();
        let issueId: string;
        if (id !== undefined) {
          issueId = `${projectId}.${id}`;
        } else if (account === accountName && project === projectName) {
          issueId = `${projectId}.${issue}`;
        }

        if (issueId && dir in LinkDirectives) {
          links.push({
            to: issueId,
            relation: LinkDirectives[dir],
          });
        }
      } else {
        break;
      }
    }
  }
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
    const p = await context.projects.findOneAndUpdate(
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
      ownerSort: null,
      created: now,
      updated: now,
      watchers: (input.watchers || []).map(id => new ObjectID(id)),
      milestone: input.milestone ? new ObjectID(input.milestone) : undefined,
      sprints: (input.sprints || []).map(id => new ObjectID(id)),
      labels: (input.labels || []),
      custom: input.custom ? customArrayToMap(input.custom) : {},
      attachments: (input.attachments || []).map(attachmentInputToAttachment),
      isPublic: !!input.isPublic,
    };

    // Validate owner
    if (input.owner) {
      if (context.user._id.equals(input.owner)) {
        record.owner = context.user._id;
        record.ownerSort = context.user.accountName;
      } else {
        const owner = await context.accounts
          .findOne<AccountRecord>({ _id: new ObjectID(input.owner) });
        if (!owner) {
          throw new UserInputError(Errors.NOT_FOUND, { field: 'owner' });
        }
        record.owner = owner._id;
        record.ownerSort = owner.accountName;
      }
    }

    if (input.comments) {
      scanForDirectives(pr.ownerName, pr.name, pr._id, input.comments, input.linked);
    }

    // Validate milestone
    if (input.milestone) {
      const milestone = await context.timeboxes.findOne({ _id: new ObjectID(input.milestone) });
      if (!milestone) {
        throw new UserInputError(Errors.NOT_FOUND, { field: 'owner' });
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

    const result = await context.issues.insertOne(record);
    const row: IssueRecord = result.ops[0];
    const linkedIssuesToUpdate: IssueRecord[] = [];
    if (result.insertedCount === 1) {
      if (input.linked && input.linked.length > 0) {
        const linksToInsert: IssueLinkRecord[] = [];
        for (const link of input.linked) {
          const target = await context.issues.findOne({ _id: link.to });
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
        const res = await context.timeline.insertMany(timelineRecordsToInsert);
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

    const issueLinks = context.db.collection<IssueLinkRecord>('issueLinks');
    const issue = await context.issues.findOne({ _id: id, deleted: { $ne: true } });
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

    if ('comments' in input) {
      scanForDirectives(
        project.ownerName, project.name, project._id, input.comments, input.linked);
    }

    // Ensure that all of the issues we are linking to actually exist.
    if (input.linked) {
      const linkedIssueIds = new Set(input.linked.map(link => link.to));
      const linkedIssues = await context.issues
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

    // TODO: ensure watchers are valid
    // TODO: ensure sprints are valid
    // TODO: ensure labels are valid
    // TODO: ensure attachments are valid
    // TODO: ensure milestones are valid

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

    if ('milestone' in input) {
      let milestoneRecord: TimeboxRecord = null;
      if (input.milestone) {
        milestoneRecord = await context.timeboxes.findOne({ _id: new ObjectID(input.milestone) });
        if (!milestoneRecord) {
          logger.error(
            'Attempt to set non-existent milestone:',
            { user, id, milestone: input.milestone });
          throw new UserInputError(Errors.NOT_FOUND);
        }
      }

      if (milestoneRecord) {
        if (!milestoneRecord._id.equals(issue.milestone)) {
          update.$set.milestone = milestoneRecord._id;
          change.milestone = { before: issue.milestone, after: new ObjectID(input.milestone) };
          change.at = now;
        }
      } else if (!input.milestone) {
        update.$set.milestone = null;
        update.$set.milestoneSort = null;
        change.milestone = { before: issue.milestone, after: null };
        change.at = now;
      }
    }

    if (!issue.sprints) {
      issue.sprints = [];
    }
    if ('sprints' in input) {
      const issueSprints = issue.sprints.map(iid => iid.toHexString());
      const sprintsPrev = new Set(issueSprints);    // Current sprints
      const sprintsNext = new Set(input.sprints);    // Newly-added items
      input.sprints.forEach(sprint => sprintsPrev.delete(sprint));
      if (issue.sprints) {
        issueSprints.forEach(sprint => sprintsNext.delete(sprint));
      }
      update.$set.sprints = input.sprints.map(iid => new ObjectID(iid));
      if (sprintsNext.size > 0 || sprintsPrev.size > 0) {
        change.sprints = {
          added: Array.from(sprintsNext).map(iid => new ObjectID(iid)),
          removed: Array.from(sprintsPrev).map(iid => new ObjectID(iid)),
        };
        change.at = now;
      }
    } else if ('addSprints' in input || 'removeSprints' in input) {
      const sprintsPrev = new Set(issue.sprints.map(sp => sp.toHexString()));
      const sprintsToAdd = new Set(input.addSprints || []);
      const sprintsAdded: ObjectID[] = [];
      const sprintsRemoved: ObjectID[] = [];
      for (const sprint of sprintsToAdd) {
        if (!sprintsPrev.has(sprint)) {
          sprintsPrev.add(sprint);
          sprintsAdded.push(strToId(sprint));
        }
      }

      for (const sprint of (input.removeSprints || [])) {
        if (sprintsPrev.has(sprint) && !sprintsToAdd.has(sprint)) {
          sprintsPrev.delete(sprint);
          sprintsRemoved.push(strToId(sprint));
        }
      }

      if (sprintsAdded.length > 0 || sprintsRemoved.length > 0) {
        change.sprints = {
          added: sprintsAdded,
          removed: sprintsRemoved,
        };
        change.at = now;
        if (sprintsAdded.length > 0) {
          if (!update.$addToSet) {
            update.$addToSet = {};
          }
          update.$addToSet.sprints = { $each: sprintsAdded };
        }
        if (sprintsRemoved.length > 0) {
          if (!update.$pullAll) {
            update.$pullAll = {};
          }
          update.$pullAll.sprints = sprintsRemoved;
        }
      }
    }

    if ('owner' in input) {
      let ownerRecord: AccountRecord = null;
      if (input.owner) {
        ownerRecord = await context.accounts.findOne({ _id: new ObjectID(input.owner) });
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

    if (!issue.watchers) {
      issue.watchers = []; // Because we renamed this field from 'cc'.
    }
    if ('watchers' in input) {
      const watchersPrev = new Set(issue.watchers
        .map(watchers => watchers.toHexString())); // Removed items
      const watchersNext = new Set(input.watchers);    // Newly-added items
      input.watchers.forEach(watchers => watchersPrev.delete(watchers));
      issue.watchers.forEach(watchers => watchersNext.delete(watchers.toHexString()));
      update.$set.watchers = input.watchers.map(strToId);
      if (watchersNext.size > 0 || watchersPrev.size > 0) {
        change.watchers = {
          added: Array.from(watchersNext.keys()).map(strToId),
          removed: Array.from(watchersPrev).map(strToId),
        };
        change.at = now;
      }
    } else if ('addWatchers' in input || 'removeWatchers' in input) {
      const watchersPrev = new Set(issue.watchers.map(watchers => watchers.toHexString()));
      const watchersToAdd = new Set(input.addWatchers || []);
      const watchersAdded: ObjectID[] = [];
      const watchersRemoved: ObjectID[] = [];
      for (const watchers of watchersToAdd) {
        if (watchers && !watchersPrev.has(watchers)) {
          watchersPrev.add(watchers);
          watchersAdded.push(strToId(watchers));
        }
      }

      for (const watchers of (input.removeWatchers || [])) {
        if (watchers && watchersPrev.has(watchers) && !watchersToAdd.has(watchers)) {
          watchersPrev.delete(watchers);
          watchersRemoved.push(strToId(watchers));
        }
      }

      if (watchersAdded.length > 0 || watchersRemoved.length > 0) {
        change.watchers = {
          added: watchersAdded,
          removed: watchersRemoved,
        };
        change.at = now;
        if (watchersAdded.length > 0) {
          if (!update.$addToSet) {
            update.$addToSet = {};
          }
          update.$addToSet.watchers = { $each: watchersAdded };
        }
        if (watchersRemoved.length > 0) {
          if (!update.$pullAll) {
            update.$pullAll = {};
          }
          update.$pullAll.watchers = watchersRemoved;
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

    if ('attachments' in input) {
      const existingAttachments = issue.attachments || [];
      issue.attachments = input.attachments.map(attachmentInputToAttachment);
      const attachmentsPrev = new Map<string, Attachment>(
        existingAttachments.map(att => [att.id.toHexString(), att] as [string, Attachment]));
      const attachmentsNext = new Map<string, Attachment>(
        issue.attachments.map(att => [att.id.toHexString(), att] as [string, Attachment]));
      input.attachments.forEach(att => attachmentsPrev.delete(att.id));
      existingAttachments.forEach(att => attachmentsNext.delete(att.id.toHexString()));
      if (attachmentsNext.size > 0 || attachmentsPrev.size > 0) {
        update.$set.attachments = issue.attachments;
        change.attachments = {
          added: Array.from(attachmentsNext.values()),
          removed: Array.from(attachmentsPrev.values()),
        };
        change.at = now;
      }
    }

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

      updateIssueLinks(
        input,
        issue,
        project,
        links,
        context.user,
        change,
        linksToInsert,
        linksToRemove,
        linksToUpdate,
        timelineRecordsToInsert);

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
      const result = await context.issues.findOneAndUpdate({ _id: issue._id }, update, {
        returnOriginal: false,
      });
      returnValue = result.value;
    }

    // Update the timeline records
    if (change.at) {
      // See if we can coalesce with a recent change
      const recentChanges = await context.timeline.find({
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
          const recordChanges: Partial<TimelineEntryRecord> = { at: change.at };
          // Merge property changes.
          if (change.type) {
            recordChanges.type = {
              before: recent.type ? recent.type.before : change.type.before,
              after: change.type.after,
            };
          }
          if (change.state) {
            recordChanges.state = {
              before: recent.state ? recent.state.before : change.state.before,
              after: change.state.after,
            };
          }
          if (change.summary) {
            recordChanges.summary = {
              before: recent.summary ? recent.summary.before : change.summary.before,
              after: change.summary.after,
            };
          }
          if (change.description) {
            recordChanges.description = {
              before: recent.description ? recent.description.before : change.description.before,
              after: change.description.after,
            };
          }
          if (change.owner) {
            recordChanges.owner = {
              before: recent.owner ? recent.owner.before : change.owner.before,
              after: change.owner.after,
            };
          }
          if (change.watchers) {
            recordChanges.watchers = {
              added: [
                ...(recent.watchers ? recent.watchers.added : []),
                ...change.watchers.added,
              ],
              removed: [
                ...(recent.watchers ? recent.watchers.removed : []),
                ...change.watchers.removed,
              ],
            };
          }
          if (change.labels) {
            recordChanges.labels = {
              added: [...(recent.labels ? recent.labels.added : []), ...change.labels.added],
              removed: [...(recent.labels ? recent.labels.removed : []), ...change.labels.removed],
            };
          }
          if (change.milestone) {
            recordChanges.milestone = {
              before: recent.milestone ? recent.milestone.before : change.milestone.before,
              after: change.milestone.after,
            };
          }
          if (change.sprints) {
            recordChanges.sprints = {
              added: [
                ...(recent.sprints ? recent.sprints.added : []),
                ...change.sprints.added,
              ],
              removed: [
                ...(recent.sprints ? recent.sprints.removed : []),
                ...change.sprints.removed,
              ],
            };
          }

          if (change.custom) {
            recordChanges.custom = [...(recent.custom || []), ...change.custom];
          }

          if (change.linked) {
            recordChanges.linked = [...(recent.linked || []), ...change.linked];
          }

          // TODO:
          // attachments?: {
          //   added?: string[];
          //   removed?: string[];
          // };
          // commentUpdated?: Date;
          // commentRemoved?: Date;

          const chgRes = await context.timeline.findOneAndUpdate(
            { _id: recent._id },
            { $set: recordChanges },
            {
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
      const timelineResults = await context.timeline.insertMany(timelineRecordsToInsert);
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

    const issue = await context.issues.findOne({ _id: id, deleted: { $ne: true } });
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

    // TODO: Mark as deleted
    // TODO: Delete all issue links
    // TODO: Send deletion

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
    const issue = await context.issues.findOne({ _id: id });
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

    const issuesToLink: IssueLinkInput[] = [];
    scanForDirectives(
      project.ownerName, project.name, project._id, [body], issuesToLink);

    if (issuesToLink) {
      // Find all links referencing this issue
      const issueLinks = context.db.collection<IssueLinkRecord>('issueLinks');
      const links = await issueLinks.find({
        $or: [
          { from: issue._id },
          { to: issue._id },
        ]
      }).toArray();

      const timelineRecordsToInsert: TimelineEntryRecord[] = [];
      const linksToInsert: IssueLinkRecord[] = [];
      const linksToRemove: IssueLinkRecord[] = [];
      const linksToUpdate: IssueLinkRecord[] = [];

      const change: TimelineEntryRecord = {
        project: project._id,
        issue: issue._id,
        by: context.user._id,
        at: null, // 'at' is also used as a marker to indicate that this record needs to be updated.
      };

      const promises: Array<Promise<any>> = [];
      updateIssueLinks(
        { addLinks: issuesToLink },
        issue,
        project,
        links,
        context.user,
        change,
        linksToInsert,
        linksToRemove,
        linksToUpdate,
        timelineRecordsToInsert);

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
      await Promise.all(promises);

      if (change.at) {
        timelineRecordsToInsert.push(change);
      }

      if (timelineRecordsToInsert.length > 0) {
        const res = await context.timeline.insertMany(timelineRecordsToInsert);
        res.ops.forEach(changeRow => {
          publish(Channels.TIMELINE_CHANGE, {
            action: ChangeAction.Added,
            value: changeRow,
          });
        });
      }
    }

    const result = await context.timeline.insertOne(record);

    publish(Channels.TIMELINE_CHANGE, {
      action: ChangeAction.Added,
      value: result.ops[0],
    });
    return result.ops[0];
  },
};
