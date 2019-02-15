import { Context } from './Context';
import {
  AccountRecord,
  CommentRecord,
  IssueLinkRecord,
  IssueChangeRecord,
  IssueRecord,
  CustomValues,
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
} from '../../../common/types/graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role, inverseRelations } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { escapeRegExp } from '../db/helpers';

interface PaginatedIssueRecords {
  count: number;
  offset: number;
  issues: IssueRecord[];
}

function customArrayToMap(custom: CustomFieldInput[]): CustomValues {
  const result: CustomValues = {};
  custom.forEach(({ key, value }) => { result[key] = value; });
  return result;
}

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
    //   const re = `(?i)\\b${escapeRegExp(toScalar(args.search.toString()))}`;
    //   filters.push((r as any).or(
    //     (r.row('summary') as any).match(re),
    //     (r.row('description') as any).match(re),
    //     // TODO: other fields - comments, etc.
    //   ));
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
    if (query.labels) {
    //   const labels = toArray(args.labels).map(l => `${account}/${project}/${l}`);
    //   if (labels) {
    //     const e = labels.reduce((expr: r.Expression<boolean>, label) => {
    //       const term = r.row('labels').contains(label);
    //       return expr ? expr.or(term) : term;
    //     }, null);
    //     if (e) {
    //       filters.push(e);
    //     }
    //   }
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
    const result = await context.db.collection('issues').find<IssueRecord>(filter).toArray();
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
    const issues = context.db.collection('issues');
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
    const issues = context.db.collection('issues');
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
    const p = await context.db.collection('projects').findOneAndUpdate(
      { _id: pr._id },
      { $inc: { issueIdCounter: 1 } });

    const now = new Date();
    const record: Partial<IssueRecord> = {
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
        const owner = await context.db.collection('issues')
          .findOne<AccountRecord>({ _id: new ObjectID(input.owner) });
        if (!owner) {
          throw new UserInputError(Errors.NOT_FOUND, { field: 'owner' });
        }
        record.owner = owner._id;
        record.ownerSort = owner.accountName;
      }
    }

    const commentsToInsert: CommentRecord[] = (input.comments || []).map(comment => ({
      issue: record._id,
      project: pr._id,
      author: context.user._id,
      body: comment,
      created: now,
      updated: now,
    }));

    const result = await context.db.collection('issues').insertOne(record);
    const row: IssueRecord = result.ops[0];
    if (result.insertedCount === 1) {
      if (commentsToInsert.length > 0) {
        await context.db.collection('comments').insertOne(commentsToInsert);
      }

      if (input.linked && input.linked.length > 0) {
        const linksToInsert: IssueLinkRecord[] = [];
        const changesToInsert: IssueChangeRecord[] = [];
        for (const link of input.linked) {
          linksToInsert.push({
            from: row._id,
            to: link.to,
            relation: link.relation,
          });
          changesToInsert.push({
            issue: row._id,
            project: pr._id,
            by: context.user._id,
            at: now,
            linked: [{ to: link.to, after: link.relation }],
          });
          const inv = inverseRelations[link.relation];
          changesToInsert.push({
            issue: link.to,
            project: pr._id,
            by: context.user._id,
            at: now,
            linked: [{ to: row._id, after: inv }],
          });
        }
        await context.db.collection('issueLinks').insertMany(linksToInsert);
        await context.db.collection('issueChanges').insertMany(changesToInsert);
      }
    }

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

    const issue = await context.db.collection('issues').findOne<IssueRecord>({ _id: id });
    if (!issue) {
      logger.error('Attempt to update non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, new ObjectID(id));
    if (!project) {
      logger.error('Attempt to update non-existent issue:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to update project:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // TODO: Compute changelog entries.

    console.log('update issue', input);
    return null;
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
    async links(row: IssueRecord, _: any, context: Context) {
      const links = await context.db.collection<IssueLinkRecord>('issueLinks').find({
        $or: [
          { from: row._id },
          { to: row._id },
        ]
      }).toArray();
      return links.map(link => {
        if (link.from === row._id) {
          return link;
        }
        return {
          to: link.from,
          from: link.to,
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
