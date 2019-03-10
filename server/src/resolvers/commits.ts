import { CommitRecord } from '../db/types';
import { Context } from './Context';
import { CommitsQueryArgs, CommitQueryArgs } from '../../../common/types/graphql';
import { ObjectID } from 'mongodb';
import { PaginatedResult } from './helpers';

export const queries = {
  commit(_: any, { id }: CommitQueryArgs, context: Context): Promise<CommitRecord> {
    const commits = context.db.collection<CommitRecord>('commits');
    // TODO: Check user role? We do know the project.
    return commits.findOne({ _id: id });
  },

  async commits(
      _: any,
      { project, issue, pagination }: CommitsQueryArgs,
      context: Context): Promise<PaginatedResult<CommitRecord>> {
    // TODO: Check user role?
    const commits = context.db.collection<CommitRecord>('commits');
    const query: any = { project: new ObjectID(project) };
    if (issue) {
      query.issues = issue;
    }
    const results = await commits.find(query).toArray();
    return {
      count: results.length,
      offset: 0,
      results,
    };
  },
};

export const types = {
  Commit: {
    id(row: CommitRecord) { return row._id; },
    createdAt: (row: CommitRecord) => row.created,
    updatedAt: (row: CommitRecord) => row.updated,
  },
};
