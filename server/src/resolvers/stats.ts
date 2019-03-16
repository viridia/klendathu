import { Context } from './Context';
import { ProjectRecord, AccountRecord } from '../db/types';
import { UserInputError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import {
  StatsQueryArgs,
  Bucket,
  TypesStatsArgs,
  StatsFilter,
  Predicate,
} from '../../../common/types/graphql';
import { stringPredicate } from './helpers';

function filterIssues(project: ProjectRecord, filter: StatsFilter) {
  const query: any = {
    project: project._id,
  };

  if (filter === undefined) {
    return query;
  }

  if ('type' in filter) {
    query.type = { $in: filter.type };
  }

  if ('state' in filter) {
    query.state = { $in: filter.state };
  }

  if ('owner' in filter) {
    query.owner = { $in: filter.owner };
  }

  if ('reporter' in filter) {
    query.reporter = { $in: filter.reporter };
  }

  if ('labels' in filter) {
    query.labels = { $in: filter.labels };
  }

  if (filter.custom) {
    for (const customSearch of filter.custom) {
      if (customSearch.pred === Predicate.In) {
        query[`custom.${customSearch.name}`] = { $in: customSearch.values };
      } else if (customSearch.pred === Predicate.NotIn) {
        query[`custom.${customSearch.name}`] = { $not: { $in: customSearch.values } };
      } else {
        query[`custom.${customSearch.name}`] =
            stringPredicate(customSearch.pred, customSearch.value);
      }
    }
  }

  return query;
}

export const queries = {
  async stats(
      _: any,
      { project: pid }: StatsQueryArgs,
      context: Context): Promise<ProjectRecord> {

    const user = context.user ? context.user.accountName : null;
    const { project, role } = await getProjectAndRole(
        context.db, context.user, new ObjectID(pid));
    if (!project) {
      logger.error('Stats for non-existent project:', { user, project: pid });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role === Role.NONE) {
      logger.error('Permission denied viewing project stats:', { user, project: pid });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    return project;
  },
};

export const types = {
  Stats: {
    async types(
        project: ProjectRecord,
        { filter }: TypesStatsArgs,
        context: Context): Promise<Bucket[]> {

      const query = filterIssues(project, filter);
      return context.db.collection('issues').aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { key: '$_id', count: '$count' } },
      ]).toArray();
    },

    async states(
        project: ProjectRecord,
        { filter }: TypesStatsArgs,
        context: Context): Promise<Bucket[]> {
      const query = filterIssues(project, filter);
      return context.db.collection('issues').aggregate([
        { $match: query },
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $project: { key: '$_id', count: '$count' } },
      ]).toArray();
    },

    async owners(
        project: ProjectRecord,
        { filter }: TypesStatsArgs,
        context: Context): Promise<Bucket[]> {
      const query = filterIssues(project, filter);
      return context.db.collection('issues').aggregate([
        { $match: query },
        { $group: { _id: '$owner', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'accounts',
            localField: '_id',
            foreignField: '_id',
            as: 'accounts',
          }
        },
        {
          $project: {
            key: '$_id',
            count: '$count',
            accounts: '$accounts',
          },
        },
      ]).toArray();
    },

    async reporters(
        project: ProjectRecord,
        { filter }: TypesStatsArgs,
        context: Context): Promise<Bucket[]> {
      const query = filterIssues(project, filter);
      return context.db.collection('issues').aggregate([
        { $match: query },
        { $group: { _id: '$reporter', count: { $sum: 1 } } },
        { $project: { key: '$_id', count: '$count' } },
      ]).toArray();
    },
  },

  Bucket: {
    accountName(row: Bucket & { accounts: AccountRecord[] }) {
      return row.accounts.length > 0 ? row.accounts[0].accountName : null;
    },
    accountDisplay(row: Bucket & { accounts: AccountRecord[] }) {
      return row.accounts.length > 0 ? row.accounts[0].display : null;
    },
  }
};
