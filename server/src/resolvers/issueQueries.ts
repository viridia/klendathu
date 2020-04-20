import { Context } from './Context';
import { IssueRecord } from '../db/types';
import {
  IssueQueryArgs,
  IssuesQueryArgs,
  IssueSearchQueryArgs,
  SearchCustomFieldsQueryArgs,
  Predicate,
  Relation,
  ReachableIssuesQueryArgs,
  TimeboxType,
} from '../../../common/types/graphql';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { escapeRegExp } from '../db/helpers';
import { stringPredicate } from './helpers';
import { MultiMap } from '../../../common/lib/MultiMap';

interface PaginatedIssueRecords {
  count: number;
  offset: number;
  issues: IssueRecord[];
}

const strToAccountId = (s: string): ObjectID => (s === 'none') ? undefined : new ObjectID(s);

export const queries = {
  async issue(
      _: any,
      { id }: IssueQueryArgs,
      context: Context): Promise<IssueRecord> {
    const user = context.user ? context.user.accountName : null;
    const issue = await context.issues.findOne({ _id: id });
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

    const filter: any = {
      project: project._id,
    };

    // If they are not a project member, only allow public issues to be viewed.
    if (role < Role.VIEWER) {
      filter.isPublic = true;
    }

    // Search by token
    if (query.search) {
      // TODO: other fields - comments, etc. That might require pipeline pre-aggregation?
      const words = query.search.split(/\s+/);
      filter.$and = [];
      for (const word of words) {
        const pattern = `(?i)\\b${escapeRegExp(word)}`;
        const idPattern = `(?i)\\.${escapeRegExp(word)}`;
        const disjuncts = [
          { summary: { $regex: pattern } },
          { description: { $regex: pattern } },
          { _id: { $regex: idPattern } },
        ];
        filter.$and.push({ $or: disjuncts });
      }
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

    // Match any milestone
    if (query.milestones && query.milestones.length > 0) {
      filter.milestone = { $in: query.milestones };
    }

    // Match any sprints
    if (query.sprints && query.sprints.length > 0) {
      filter.sprints = { $in: query.sprints.map(id => new ObjectID(id)) };
    }

    // Match sprints in a given state.
    if (query.sprintStatus && query.sprintStatus.length > 0) {
      // Fetch sprints in that state.
      const timeboxQuery = {
        project: new ObjectID(query.project),
        status: { $in: query.sprintStatus },
        type: TimeboxType.Sprint,
      };

      const sprints = (await context.timeboxes.find(timeboxQuery).toArray())
        .map(sp => new ObjectID(sp._id));
      if (filter.sprints) {
        filter.sprints.$in = sprints.concat(filter.sprints.$in);
      } else {
        filter.sprints = { $in: sprints };
      }
    }

    // Match any watcher
    if (query.watchers && query.watchers.length > 0) {
      const watchers = query.watchers.map(strToAccountId);
      filter.watchers = { $in: watchers };
    //   if (watchers) {
    //     const e = watchers.reduce((expr: r.Expression<boolean>, uid) => {
    //       const term = r.row('watchers').contains(uid);
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
        if (customSearch.pred === Predicate.In) {
          filter[`custom.${customSearch.name}`] = { $in: customSearch.values };
        } else if (customSearch.pred === Predicate.NotIn) {
          filter[`custom.${customSearch.name}`] = { $not: { $in: customSearch.values } };
        } else {
          filter[`custom.${customSearch.name}`] =
              stringPredicate(customSearch.pred, customSearch.value);
        }
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
        } else if (key === 'owner') {
          key = 'ownerSort';
        } else if (key === 'reporter') {
          key = 'reporterSort';
        }
        // TODO: Sort by custom field
        if (key.startsWith('custom.')) {
          //
        }
        sort[key] = order;
      }
    } else {
      sort.index = 1;
    }

    // console.log(query);
    // console.log(filter);
    // console.log(sort);
    // Generate numeric index from _id (for sorting).
    const result: IssueRecord[] = await context.issues.aggregate([
      { $match: filter },
      { $addFields: {
        // Add an 'index' field derived from the _id.
        index: { $toInt: { $arrayElemAt: [{ $split: ['$_id', '.'] }, 1] } },
        // Sort unassigned (null) owners last.
        ownerSort: { $ifNull: ['$ownerSort', false] },
      }},
      { $sort: sort },
    ]).toArray();

    // TODO: Find related subtasks
    // if (query.subtasks) {
    //   const idList = result.map(issue => issue._id);
    //   // console.log(idList);
    //   const reachable = await context.issueLinks.find({
    //     $or: [
    //       { from: { $in: idList } },
    //       { to: { $in: idList } },
    //     ],
    //     relation: { $in: [Relation.PartOf, Relation.HasPart] },
    //   }).toArray();
    //   console.log('subtasks', reachable);
    // }

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
    console.log(pr, context.issues);
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
    console.log(context.issues);
    // TODO: Implement
    // if (args.accountName) {
    //   return accounts.findOne({ accountName: args.accountName });
    // } else if (args.id) {
    //   return accounts.findOne({ _id: new ObjectID(args.id) });
    // }
    return null;
  },

  async reachableIssues(
    _: any,
    { rootSet }: ReachableIssuesQueryArgs,
    context: Context): Promise<any[]> {
    const idSet = new Set(rootSet);
    const parentMap = new MultiMap<string, string>();
    const blockedMap = new MultiMap<string, string>();
    const relatedMap = new MultiMap<string, string>();

    // Expand the set of ids until we cannot find any more.
    const idsToSearch = new Set(idSet);
    while (idsToSearch.size > 0) {
      // Query links which connect to the search set.
      const idList = Array.from(idSet);
      const reachable = await context.issueLinks.find({
        $or: [
          { from: { $in: idList } },
          { to: { $in: idList } },
        ],
        relation: { $nin: [Relation.Duplicate] },
      }).toArray();

      // Compute frontier ids: set of ids not already in the result set.
      idsToSearch.clear();
      for (const link of reachable) {
        if (link.relation === Relation.PartOf) {
          parentMap.addUnique(link.from, link.to);
        } else if (link.relation === Relation.HasPart) {
          parentMap.addUnique(link.to, link.from);
        } else if (link.relation === Relation.BlockedBy) {
          blockedMap.addUnique(link.from, link.to);
        } else if (link.relation === Relation.Blocks) {
          blockedMap.addUnique(link.to, link.from);
        } else if (link.relation === Relation.Related) {
          relatedMap.addUnique(link.from, link.to);
          relatedMap.addUnique(link.to, link.from);
        } else {
          continue;
        }

        if (!idSet.has(link.from)) {
          idsToSearch.add(link.from);
          idSet.add(link.from);
        }
        if (!idSet.has(link.to)) {
          idsToSearch.add(link.to);
          idSet.add(link.to);
        }
      }
    }

    const issues = await context.issues.aggregate([
      { $match: { _id: { $in: Array.from(idSet) } } },
      { $addFields: {
        // Add an 'index' field derived from the _id.
        index: { $toInt: { $arrayElemAt: [{ $split: ['$_id', '.'] }, 1] } },
      }},
    ]).toArray();

    return issues.map(issue => ({
      issue,
      parents: parentMap.get(issue._id),
      blockedBy: blockedMap.get(issue._id),
      related: relatedMap.get(issue._id),
    }));
  },
};
