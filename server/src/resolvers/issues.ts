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
  IssueQueryArgs,
  IssuesQueryArgs,
  IssueSearchQueryArgs,
  SearchCustomFieldsQueryArgs,
  NewIssueMutationArgs,
  UpdateIssueMutationArgs,
  DeleteIssueMutationArgs,
  CustomFieldInput,
  Predicate,
  ChangeAction,
  IssuesChangedSubscriptionArgs,
  CustomFieldChange,
  Relation,
  AddCommentMutationArgs,
  IssueChangedSubscriptionArgs,
  TimelineChangedSubscriptionArgs,
} from '../../../common/types/graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role, inverseRelations } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { escapeRegExp } from '../db/helpers';
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './pubsub';

const ISSUE_CHANGE = 'issue-change';
const TIMELINE_CHANGE = 'timeline-change';

interface IssueRecordChange {
  value: IssueRecord;
  action: ChangeAction;
}

interface TimelineRecordChange {
  value: TimelineEntryRecord;
  action: ChangeAction;
}

interface PaginatedIssueRecords {
  count: number;
  offset: number;
  issues: IssueRecord[];
}

function customArrayToMap(custom: CustomFieldInput[]): CustomValues {
  const result: CustomValues = {};
  custom.forEach(({ key, value }) => { if (value !== null) { result[key] = value; } });
  return result;
}

const strToId = (s: string): ObjectID => new ObjectID(s);

function stringPredicate(pred: Predicate, value: string): any {
  switch (pred) {
    case Predicate.In:
      return { $regex: escapeRegExp(value), $options: 'i' };
    case Predicate.Equals:
      return value;
    case Predicate.NotIn:
      return { $not: new RegExp(escapeRegExp(value), 'i') };
    case Predicate.NotEquals:
      return { $ne: value };
    case Predicate.StartsWith:
      return { $regex: `^${escapeRegExp(value)}`, $options: 'i' };
    case Predicate.EndsWith:
      return { $regex: `${escapeRegExp(value)}$`, $options: 'i' };
    default:
      logger.error('Invalid string predicate:', pred);
      return null;
  }
}

export const queries = {
  async issue(
      _: any,
      { id }: IssueQueryArgs,
      context: Context): Promise<IssueRecord> {
    const user = context.user ? context.user.accountName : null;
    const issue = await context.db.collection('issues').findOne<IssueRecord>({ _id: id });
    if (!issue) {
      logger.error('Attempt to fetch non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, issue.project);
    if (!project) {
      logger.error('Issue references non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role === Role.NONE) {
      logger.error('Permission denied viewing issue:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    return issue;
  },

  async issues(
      _: any,
      { query, pagination }: IssuesQueryArgs,
      context: Context): Promise<PaginatedIssueRecords> {

    const user = context.user ? context.user.accountName : null;
    const issues = context.db.collection<IssueRecord>('issues');
    const { project, role } = await getProjectAndRole(
        context.db, context.user, new ObjectID(query.project));
    if (!project) {
      logger.error('Query to non-existent project:', { user, project: query.project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role === Role.NONE) {
      logger.error('Permission denied viewing issue:', { user, project: query.project });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // const order: r.Sort = { index: r.desc('id') };
    const filter: any = {
      project: project._id,
    };

    // TODO: All of the various query things.

    // let dbQuery = r.table('issues')
    //     .orderBy(order)
    //     .filter({ project: `${account}/${project}` });

    // If they are not a project member, only allow public issues to be viewed.
    if (role < Role.VIEWER) {
      filter.isPublic = true;
    }

    // Search by token
    if (query.search) {
      // TODO: other fields - comments, etc.
      const words = query.search.split(/\s+/);
      const matchers = words.map(word => `(?i)\\b${escapeRegExp(word)}`);
      filter.$and = matchers.map(m => ({ $or: [
        { summary: { $regex: m } },
        { description: { $regex: m } },
      ] }));
    }

    // By Type
    if (query.type) {
      filter.type = query.type.length === 1 ? query.type[0] : { $in: query.type };
    }

    // By State
    if (query.state) {
      filter.state = query.state.length === 1 ? query.state[0] : { $in: query.state };
    }

    // By Summary
    if (query.summary) {
      query.summary = stringPredicate(query.summaryPred, query.summary);
      if (!query.summary) {
        throw new UserInputError(Errors.INVALID_PREDICATE);
      }
    }

    // By Description
    if (query.description) {
      query.description = stringPredicate(query.descriptionPred, query.description);
      if (!query.description) {
        throw new UserInputError(Errors.INVALID_PREDICATE);
      }
    }

    // By Reporter
    if (query.reporter) {
      filter.reporter = query.reporter.length === 1 ? query.reporter[0] : { $in: query.reporter };
    }

    // By Owner
    if (query.owner) {
      filter.owner = query.owner.length === 1 ? query.owner[0] : { $in: query.owner };
    }

    // Match any label
    if (query.labels && query.labels.length > 0) {
      filter.labels = { $in: query.labels };
    }

    // Match any cc
    if (query.cc) {
    //   const cc = await lookupUsers(args.cc);
    //   if (cc) {
    //     const e = cc.reduce((expr: r.Expression<boolean>, uid) => {
    //       const term = r.row('cc').contains(uid);
    //       return expr ? expr.or(term) : term;
    //     }, null);
    //     if (e) {
    //       filters.push(e);
    //     }
    //   }
    }

    // // Other things we might want to search by:
    // // comments / commenter
    // // created (date range)
    // // updated

    if (query.custom) {
      for (const customSearch of query.custom) {
        console.log(customSearch);
      //   if (key.startsWith('custom.')) {
      //     const fieldId = key.slice(7);
      //     const pred = args[`pred.${fieldId}`] as Predicate || Predicate.CONTAINS;
      //     const expr = stringPredicate(r.row('custom')(fieldId), pred, args[key]);
      //     if (expr) {
      //       // console.log(expr.toString());
      //       filters.push(expr);
      //     }
      //   }
      }
    }

    // if (req.subtasks) {
    //   return this.findSubtasks(query, sort);
    // }
    const result = await issues.find(filter).toArray();
    return {
      count: result.length,
      offset: 0,
      issues: result,
    };
  },

  async issueSearch(
      _: any,
      { project, search }: IssueSearchQueryArgs,
      context: Context): Promise<IssueRecord[]> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project: pr, role } =
        await getProjectAndRole(context.db, context.user, new ObjectID(project));
    if (!project) {
      logger.error('Attempt to update non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to update project:', { user, project });
      throw new UserInputError(Errors.FORBIDDEN);
    }
    const issues = context.db.collection<IssueRecord>('issues');
    console.log(pr, issues);
    // if (args.accountName) {
    //   return accounts.findOne({ accountName: args.accountName });
    // } else if (args.id) {
    //   return accounts.findOne({ _id: new ObjectID(args.id) });
    // }
    return null;
  },

  searchCustomFields(
      _: any,
      { project, field, search }: SearchCustomFieldsQueryArgs,
      context: Context): Promise<IssueRecord[]> {
    const issues = context.db.collection<IssueRecord>('issues');
    console.log(issues);
    // if (args.accountName) {
    //   return accounts.findOne({ accountName: args.accountName });
    // } else if (args.id) {
    //   return accounts.findOne({ _id: new ObjectID(args.id) });
    // }
    return null;
  },
};

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
          pubsub.publish(TIMELINE_CHANGE, {
            action: ChangeAction.Added,
            value: changeRow,
          });
        });
      }
    }

    // Notify this issue was added
    pubsub.publish(ISSUE_CHANGE, {
      action: ChangeAction.Added,
      value: row,
    });

    // Notify issues we linked to were changed
    linkedIssuesToUpdate.forEach(iss => {
      pubsub.publish(ISSUE_CHANGE, {
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

    // TODO: ensure reporter is valid
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
      } else if (!issue.owner) {
        update.$set.owner = null;
        update.$set.ownerSort = null;
        change.owner = { before: issue.owner, after: new ObjectID(input.owner) };
        change.at = now;
      }
    }

    if ('cc' in input) {
      const ccPrev = new Set(issue.cc.map(cc => cc.toHexString())); // Removed items
      const ccNext = new Set(input.cc);    // Newly-added items
      input.cc.forEach(cc => ccPrev.delete(cc));
      issue.cc.forEach(cc => ccNext.delete(cc.toHexString()));
      update.$set.cc = input.cc;
      if (ccNext.size > 0 || ccPrev.size > 0) {
        change.cc = {
          added: Array.from(ccNext.keys()).map(strToId),
          removed: Array.from(ccPrev).map(strToId),
        };
        change.at = now;
      }
    }

    if ('labels' in input) {
      const labelsPrev = new Set(issue.labels);     // Removed items
      const labelsNext = new Set(input.labels);    // Newly-added items
      input.labels.forEach(labels => labelsPrev.delete(labels));
      issue.labels.forEach(labels => labelsNext.delete(labels));
      update.$set.labels = input.labels;
      if (labelsNext.size > 0 || labelsPrev.size > 0) {
        change.labels = {
          added: Array.from(labelsNext).map(strToId),
          removed: Array.from(labelsPrev).map(strToId),
        };
        change.at = now;
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

    if ('linked' in input) {
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
            change.linked.push({ to: link.to, before: inverseRelations[rvs.relation], after: inv });
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

    if (change.at) {
      timelineRecordsToInsert.push(change);
    }

    // if (additionalChangeRecords.length > 0) {
    //   promises.push(timeline.insertMany(additionalChangeRecords));
    // }

    await Promise.all(promises);

    let returnValue: IssueRecord = issue;
    if (change.at) {
      const result = await issues.findOneAndUpdate({ _id: issue._id }, update, {
        returnOriginal: false,
      });
      returnValue = result.value;
    }

    if (timelineRecordsToInsert.length > 0) {
      const timelineResults = await timeline.insertMany(timelineRecordsToInsert);
      timelineResults.ops.forEach(changeRow => {
        pubsub.publish(TIMELINE_CHANGE, {
          action: ChangeAction.Added,
          value: changeRow,
        });
      });
    }

    // The issue record didn't change, but the timeline might have.
    pubsub.publish(ISSUE_CHANGE, {
      action: ChangeAction.Changed,
      value: issue,
    });
    return returnValue;
  },

    // // Compute which cc entries have been added or deleted.
    // if (input.addCC || input.removeCC) {
    //   const added: string[] = [];
    //   const removed: string[] = [];

    //   const cc = [...issue.cc];
    //   if (input.addCC) {
    //     for (const l of input.addCC) {
    //       if (cc.indexOf(l) < 0) {
    //         added.push(l);
    //         cc.push(l);
    //       }
    //     }
    //   }

    //   if (input.removeCC) {
    //     for (const l of input.removeCC) {
    //       const index = cc.indexOf(l);
    //       if (index >= 0) {
    //         removed.push(l);
    //         cc.splice(index, 1);
    //       }
    //     }
    //   }

    //   if (added || removed) {
    //     record.cc = cc;
    //     change.cc = { added, removed };
    //     change.at = record.updated;
    //   }
    // } else if ('cc' in input) {
    //   const ccPrev = new Set(issue.cc); // Removed items
    //   const ccNext = new Set(input.cc);    // Newly-added items
    //   input.cc.forEach(cc => ccPrev.delete(cc));
    //   issue.cc.forEach(cc => ccNext.delete(cc));
    //   record.cc = input.cc;
    //   if (ccNext.size > 0 || ccPrev.size > 0) {
    //     change.cc = { added: Array.from(ccNext), removed: Array.from(ccPrev) };
    //     change.at = record.updated;
    //   }
    // }

    // // Compute which labels have been added or deleted.
    // if (input.addLabels || input.removeLabels) {
    //   const added: string[] = [];
    //   const removed: string[] = [];

    //   const labels = [...issue.labels];
    //   if (input.addLabels) {
    //     for (const l of input.addLabels) {
    //       if (labels.indexOf(l) < 0) {
    //         added.push(l);
    //         labels.push(l);
    //       }
    //     }
    //   }

    //   if (input.removeLabels) {
    //     for (const l of input.removeLabels) {
    //       const index = labels.indexOf(l);
    //       if (index >= 0) {
    //         removed.push(l);
    //         labels.splice(index, 1);
    //       }
    //     }
    //   }

    //   if (added || removed) {
    //     record.labels = labels;
    //     change.labels = { added, removed };
    //     change.at = record.updated;
    //   }
    // }

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
    pubsub.publish(TIMELINE_CHANGE, {
      action: ChangeAction.Added,
      value: result.ops[0],
    });
    return result.ops[0];
  },
};

export const subscriptions = {
  issueChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([ISSUE_CHANGE]),
      (
        change: IssueRecordChange,
        { issue }: IssueChangedSubscriptionArgs,
        context: Context
      ) => {
        // TODO: Need a fast way to check project membership
        return context.user && change.value._id === issue;
      }
    ),
    resolve: (payload: IssueRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
  issuesChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([ISSUE_CHANGE]),
      (
        change: IssueRecordChange,
        { project }: IssuesChangedSubscriptionArgs,
        context: Context
      ) => {
        // TODO: Need a fast way to check project membership
        return context.user && change.value.project.equals(project);
      }
    ),
    resolve: (payload: IssueRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
  timelineChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([TIMELINE_CHANGE]),
      (
        change: TimelineRecordChange,
        { issue, project }: TimelineChangedSubscriptionArgs,
        context: Context
      ) => {
        // TODO: Need a fast way to check project membership
        if (!change.value.project.equals(project)) {
          return false;
        }
        if (issue) {
          return change.value.issue === issue;
        } else {
          return true;
        }
      }
    ),
    resolve: (payload: TimelineRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
};

export const types = {
  Issue: {
    id(row: IssueRecord) { return row._id; },
    owner: (row: IssueRecord) => row.owner ? row.owner.toHexString() : null,
    createdAt: (row: IssueRecord) => row.created,
    updatedAt: (row: IssueRecord) => row.updated,
    custom(row: IssueRecord) {
      return Object.getOwnPropertyNames(row.custom).map(key => ({
        key,
        value: row.custom[key]
      }));
    },
    reporterAccount(row: IssueRecord, _: any, context: Context): Promise<AccountRecord> {
      return context.db.collection<AccountRecord>('accounts').findOne({ _id: row.reporter });
    },
    ownerAccount(row: IssueRecord, _: any, context: Context): Promise<AccountRecord> {
      if (row.owner) {
        return context.db.collection<AccountRecord>('accounts').findOne({ _id: row.owner });
      }
      return null;
    },
    async ccAccounts(row: IssueRecord, _: any, context: Context): Promise<AccountRecord[]> {
      if (row.cc && row.cc.length > 0) {
        return context.db.collection<AccountRecord>('accounts')
            .find({ _id: { $in: row.cc } }).toArray();
      }
      return [];
    },
    async links(row: IssueRecord, _: any, context: Context) {
      const links = await context.db.collection<IssueLinkRecord>('issueLinks').find({
        $or: [
          { from: row._id },
          { to: row._id },
        ]
      }).toArray();
      // Links that are from the specified issue are returned as-is; links that are
      // to the issue are returned with the inverse relation.
      return links.map(link => {
        if (link.from === row._id) {
          return link;
        }
        return {
          to: link.from,
          from: row._id,
          relation: inverseRelations[link.relation],
        };
      });
    },
  },
  CustomValue: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
  },
};
