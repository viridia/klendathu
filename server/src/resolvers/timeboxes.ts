import { TimeboxRecord } from '../db/types';
import { Context } from './Context';
import {
  NewTimeboxMutationArgs,
  UpdateTimeboxMutationArgs,
  DeleteTimeboxMutationArgs,
  TimeboxesQueryArgs,
  ChangeAction,
  TimeboxChangedSubscriptionArgs,
} from '../../../common/types/graphql';
import { escapeRegExp } from '../db/helpers';
import { ObjectID, UpdateQuery, FilterQuery } from 'mongodb';
import { AuthenticationError, UserInputError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { logger } from '../logger';
import { getProjectAndRole } from '../db/role';
import { Channels, publish, RecordChange, getPubSub } from './pubsub';
import { withFilter } from 'graphql-subscriptions';

type TimeboxRecordChange = RecordChange<TimeboxRecord>;

interface PaginatedTimeboxRecords {
  count: number;
  offset: number;
  results: TimeboxRecord[];
}

export const queries = {
  async timeboxes(
      _: any,
      { project, input }: TimeboxesQueryArgs,
      context: Context): Promise<PaginatedTimeboxRecords> {
    const query: FilterQuery<TimeboxRecord> = { project: new ObjectID(project) };
    if (input.search) {
      const pattern = `(?i)\\b${escapeRegExp(input.search)}`;
      query.name = { $regex: pattern };
    }
    if (input.status) {
      query.status = { $in: input.status };
    }
    if (input.dateRangeStart) {
      query.endDate = { $le: input.dateRangeStart };
    }
    if (input.dateRangeEnd) {
      query.startDate = { $ge: input.dateRangeEnd };
    }
    const results = await context.timeboxes.find(query).sort({ startDate: 1 }).toArray();
    return {
      count: results.length,
      offset: 0,
      results,
    };
  },
};

export const mutations = {
  async newTimebox(
      _: any,
      { project, input }: NewTimeboxMutationArgs,
      context: Context): Promise<TimeboxRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project: pr, role } =
      await getProjectAndRole(context.db, context.user, new ObjectID(project));
    if (!pr) {
      logger.error('Attempt to create timebox for non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to create timebox:', { user, project });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const now = new Date();
    const record: TimeboxRecord = {
      project: pr._id,
      name: input.name,
      type: input.type,
      description: input.description,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      createdBy: context.user._id,
      created: now,
      updated: now,
    };

    const result = await context.timeboxes.insertOne(record);
    publish(Channels.TIMEBOX_CHANGE, {
      action: ChangeAction.Added,
      value: result.ops[0],
    });
    return result.ops[0];
  },

  async updateTimebox(
      _: any,
      { id, input }: UpdateTimeboxMutationArgs,
      context: Context): Promise<TimeboxRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const timebox = await context.timeboxes.findOne({ _id: new ObjectID(id) });
    if (!timebox) {
      logger.error('Attempt to update non-existent timebox:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, timebox.project);
    if (!project) {
      logger.error('Attempt to update timebox for non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to update timebox:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const now = new Date();
    const record: UpdateQuery<TimeboxRecord> = {
      $set: { updated: now },
    };

    if ('name' in input) {
      record.$set.name = input.name;
    }

    if ('description' in input) {
      record.$set.description = input.description;
    }

    if ('status' in input) {
      record.$set.status = input.status;
    }

    if ('startDate' in input) {
      record.$set.startDate = input.startDate;
    }

    if ('endDate' in input) {
      record.$set.endDate = input.endDate;
    }

    const result = await context.timeboxes.findOneAndUpdate(
      { _id: timebox._id },
      record,
      { returnOriginal: false }
    );
    publish(Channels.TIMEBOX_CHANGE, {
      action: ChangeAction.Changed,
      value: result.value,
    });
    return result.value;
  },

  async deleteTimebox(
    _: any,
    { id }: DeleteTimeboxMutationArgs,
    context: Context): Promise<TimeboxRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;
    const timebox = await context.timeboxes.findOne({ _id: new ObjectID(id) });
    if (!timebox) {
      logger.error('Attempt to delete non-existent timebox:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, timebox.project);
    if (!project) {
      logger.error('Attempt to delete timebox for non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to delete timebox:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // publish(Channels.TIMEBOX_CHANGE, {
    //   action: ChangeAction.Removed,
    //   value: project,
    // });

    // TODO: Implement
    // We need to remove this timebox from all issues in the project.
    return null;
  },
};

export const subscriptions = {
  timeboxChanged: {
    subscribe: withFilter(
      () => getPubSub().asyncIterator([Channels.TIMEBOX_CHANGE]),
      (
        { value }: TimeboxRecordChange,
        { project }: TimeboxChangedSubscriptionArgs,
        context: Context) => {
        return context.user && new ObjectID(value.project).equals(project);
      }
    ),
    resolve: (payload: TimeboxRecordChange) => {
      return payload;
    },
  },
};

export const types = {
  Timebox: {
    id(row: TimeboxRecord) { return row._id; },
    createdAt: (row: TimeboxRecord) => row.created,
    updatedAt: (row: TimeboxRecord) => row.updated,
  },
};
