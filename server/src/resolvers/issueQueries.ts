import { Context } from './Context';
import { IssueRecord } from '../db/types';
import {
  IssueQueryArgs,
  IssuesQueryArgs,
  IssueSearchQueryArgs,
  SearchCustomFieldsQueryArgs,
  Predicate,
} from '../../../common/types/graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { escapeRegExp } from '../db/helpers';

interface PaginatedIssueRecords {
  count: number;
  offset: number;
  issues: IssueRecord[];
}

const strToAccountId = (s: string): ObjectID => (s === 'none') ? undefined : new ObjectID(s);

function stringPredicate(pred: Predicate, value: string): any {
  switch (pred) {
    case Predicate.In:
    case Predicate.Contains:
      return { $regex: escapeRegExp(value), $options: 'i' };
    case Predicate.Equals:
      return value;
    case Predicate.NotIn:
    case Predicate.NotContains:
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

    const filter: any = {
      project: project._id,
    };

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
      filter.summary = stringPredicate(query.summaryPred, query.summary);
      if (!query.summary) {
        throw new UserInputError(Errors.INVALID_PREDICATE);
      }
    }

    // By Description
    if (query.description) {
      filter.description = stringPredicate(query.descriptionPred, query.description);
      if (!query.description) {
        throw new UserInputError(Errors.INVALID_PREDICATE);
      }
    }

    // By Reporter
    if (query.reporter && query.reporter.length > 0) {
      const reporter = query.reporter.map(strToAccountId);
      filter.reporter = reporter.length === 1 ? reporter[0] : { $in: reporter };
    }

    // By Owner
    if (query.owner && query.owner.length > 0) {
      const owner = query.owner.map(strToAccountId);
      filter.owner = owner.length === 1 ? owner[0] : { $in: owner };
    }

    // Match any label
    if (query.labels && query.labels.length > 0) {
      filter.labels = { $in: query.labels };
    }

    // Match any cc
    if (query.cc && query.cc.length > 0) {
      const cc = query.cc.map(strToAccountId);
      filter.cc = { $in: cc };
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

    // TODO: Search by date, comments
    // // Other things we might want to search by:
    // // comments / commenter
    // // created (date range)
    // // updated

    if (query.custom) {
      for (const customSearch of query.custom) {
        console.log(customSearch);
        // TODO: Search by custom field
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

    const sort: any = {};
    if (query.sort && query.sort.length > 0) {
      for (const sortKey of query.sort) {
        let key = sortKey;
        let order = 1;
        if (sortKey.startsWith('-')) {
          order = -1;
          key = sortKey.slice(1);
        }
        if (key === 'id') {
          key = 'index';
        }
        // TODO: Sort by custom field
        // if (key.startsWith('custom.')) {
        //   //
        // }
        sort[key] = order;
      }
    } else {
      sort.index = 1;
    }

    // TODO: Find related subtasks
    // if (req.subtasks) {
    //   return this.findSubtasks(query, sort);
    // }
    // console.log(filter);
    // console.log(sort);
    // Generate numeric index from _id (for sorting).
    const result = await issues.aggregate([
      { $match: filter },
      { $addFields: { index: { $toInt: { $arrayElemAt: [{ $split: [ '$_id', '.' ] }, 1] } } } },
      { $sort: sort },
    ]).toArray();
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
    // TODO: Implement
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
    // TODO: Implement
    // if (args.accountName) {
    //   return accounts.findOne({ accountName: args.accountName });
    // } else if (args.id) {
    //   return accounts.findOne({ _id: new ObjectID(args.id) });
    // }
    return null;
  },
};
