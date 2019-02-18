import { LabelRecord, CommentRecord } from '../db/types';
import { Context } from './Context';
import { CommentsQueryArgs } from '../../../common/types/graphql';
import { ObjectID } from 'mongodb';
import { UserInputError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { logger } from '../logger';
import { getProjectAndRole } from '../db/role';

interface PaginatedCommentRecords {
  count: number;
  offset: number;
  results: CommentRecord[];
}

export const queries = {
  async comments(
      _: any,
      { project: pid, issue, pagination }: CommentsQueryArgs,
      context: Context): Promise<PaginatedCommentRecords> {
    const user = context.user ? context.user.accountName : null;
    const comments = context.db.collection<CommentRecord>('comments');
    const { project, role } = await getProjectAndRole(
        context.db, context.user, new ObjectID(pid));
    if (!project) {
      logger.error('Query to non-existent project:', { user, project: pid });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role === Role.NONE) {
      logger.error('Permission denied viewing issue changes:', { user, project: pid });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // const order: r.Sort = { index: r.desc('id') };
    const filter: any = {
      project: project._id,
    };

    if (issue) {
      filter.issue = issue;
    }

    const results = await comments.find(filter).sort({ created: 1 }).toArray();
    return {
      count: results.length,
      offset: 0,
      results,
    };
  },
};

export const types = {
  Comment: {
    id(row: LabelRecord) { return row._id; },
  },
};
