import { Context } from './Context';
import { IssueChangeRecord } from '../db/types';
import { IssueChangesQueryArgs } from '../../../common/types/graphql';
import { UserInputError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';

interface PaginatedIssueChangeRecords {
  count: number;
  offset: number;
  results: IssueChangeRecord[];
}

export const queries = {
  async issueChanges(
      _: any,
      { project: pid, issue, pagination }: IssueChangesQueryArgs,
      context: Context): Promise<PaginatedIssueChangeRecords> {

    const user = context.user ? context.user.accountName : null;
    const issueChanges = context.db.collection<IssueChangeRecord>('issueChanges');
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

    const result = await issueChanges.find(filter).sort({ at: 1 }).toArray();
    return {
      count: result.length,
      offset: 0,
      results: result,
    };
  },

  async comments(
      _: any,
      { project: pid, issue, pagination }: IssueChangesQueryArgs,
      context: Context): Promise<PaginatedIssueChangeRecords> {

    const user = context.user ? context.user.accountName : null;
    const issueChanges = context.db.collection<IssueChangeRecord>('issueChanges');
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

    const result = await issueChanges.find(filter).sort({ at: 1 }).toArray();
    return {
      count: result.length,
      offset: 0,
      results: result,
    };
  },
};

export const types = {
  IssueChangeEntry: {
    id: (row: IssueChangeRecord) => row._id,
    by: (row: IssueChangeRecord) => row.by ? row.by.toHexString() : null,
  },
};
