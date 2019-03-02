import { Context } from './Context';
import { TimelineEntryRecord } from '../db/types';
import { UserInputError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { TimelineQueryArgs } from '../../../common/types/graphql';

interface PaginatedIssueChangeRecords {
  count: number;
  offset: number;
  results: TimelineEntryRecord[];
}

export const queries = {
  async timeline(
      _: any,
      { project: pid, issue, pagination, recent }: TimelineQueryArgs,
      context: Context): Promise<PaginatedIssueChangeRecords> {

    const user = context.user ? context.user.accountName : null;
    const timeline = context.db.collection<TimelineEntryRecord>('timeline');
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

    const filter: any = {
      project: project._id,
    };

    if (issue) {
      filter.issue = issue;
    }

    // If they are not a project member, only allow public issues to be viewed.
    // if (role < Role.VIEWER) {
    //   filter.isPublic = true;
    // }

    const result = await timeline.find(filter).sort({ at: recent ? -1 : 1 }).toArray();
    return {
      count: result.length,
      offset: 0,
      results: result,
    };
  },

  async comments(
      _: any,
      { project: pid, issue, pagination }: TimelineQueryArgs,
      context: Context): Promise<PaginatedIssueChangeRecords> {

    const user = context.user ? context.user.accountName : null;
    const timeline = context.db.collection<TimelineEntryRecord>('timeline');
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

    const filter: any = {
      project: project._id,
      commentBody: { $exists: true }
    };

    if (issue) {
      filter.issue = issue;
    }

    // If they are not a project member, only allow public issues to be viewed.
    // if (role < Role.VIEWER) {
    //   filter.isPublic = true;
    // }

    const result = await timeline.find(filter).sort({ at: 1 }).toArray();
    return {
      count: result.length,
      offset: 0,
      results: result,
    };
  },
};

export const types = {
  TimelineEntry: {
    id: (row: TimelineEntryRecord) => row._id,
    by: (row: TimelineEntryRecord) => row.by ? row.by.toHexString() : null,
  },
};
