import { MilestoneRecord } from '../db/types';
import { Context } from './Context';
import {
  NewMilestoneMutationArgs,
  UpdateMilestoneMutationArgs,
  DeleteMilestoneMutationArgs,
  MilestonesQueryArgs,
  ChangeAction,
  MilestoneChangedSubscriptionArgs,
} from '../../../common/types/graphql';
import { escapeRegExp } from '../db/helpers';
import { ObjectID, UpdateQuery, FilterQuery } from 'mongodb';
import { AuthenticationError, UserInputError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { logger } from '../logger';
import { getProjectAndRole } from '../db/role';
import { pubsub, Channels, publish, RecordChange } from './pubsub';
import { withFilter } from 'graphql-subscriptions';

type MilestoneRecordChange = RecordChange<MilestoneRecord>;

export const queries = {
  async milestones(
      _: any,
      { project, input }: MilestonesQueryArgs,
      context: Context): Promise<MilestoneRecord[]> {
    const query: FilterQuery<MilestoneRecord> = { project: new ObjectID(project) };
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
    return context.milestones.find(query).sort({ startDate: 1 }).toArray();
  },
};

export const mutations = {
  async newMilestone(
      _: any,
      { project, input }: NewMilestoneMutationArgs,
      context: Context): Promise<MilestoneRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project: pr, role } =
      await getProjectAndRole(context.db, context.user, new ObjectID(project));
    if (!pr) {
      logger.error('Attempt to create milestone for non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to create milestone:', { user, project });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const now = new Date();
    const record: MilestoneRecord = {
      project: pr._id,
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      creator: context.user._id,
      created: now,
      updated: now,
    };

    const result = await context.milestones.insertOne(record);
    publish(Channels.MILESTONE_CHANGE, {
      action: ChangeAction.Added,
      value: result.ops[0],
    });
    return result.ops[0];
  },

  async updateMilestone(
      _: any,
      { id, input }: UpdateMilestoneMutationArgs,
      context: Context): Promise<MilestoneRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const milestone = await context.milestones.findOne({ _id: new ObjectID(id) });
    if (!milestone) {
      logger.error('Attempt to update non-existent milestone:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, milestone.project);
    if (!project) {
      logger.error('Attempt to update milestone for non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to update milestone:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const now = new Date();
    const record: UpdateQuery<MilestoneRecord> = {
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

    const result = await context.milestones.findOneAndUpdate(
      { _id: milestone._id },
      record,
      { returnOriginal: false }
    );
    publish(Channels.MILESTONE_CHANGE, {
      action: ChangeAction.Changed,
      value: result.value,
    });
    return result.value;
  },

  async deleteMilestone(
    _: any,
    { id }: DeleteMilestoneMutationArgs,
    context: Context): Promise<MilestoneRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;
    const milestone = await context.milestones.findOne({ _id: new ObjectID(id) });
    if (!milestone) {
      logger.error('Attempt to delete non-existent milestone:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, milestone.project);
    if (!project) {
      logger.error('Attempt to delete milestone for non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to delete milestone:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // publish(Channels.MILESTONE_CHANGE, {
    //   action: ChangeAction.Removed,
    //   value: project,
    // });

    // TODO: Implement
    // We need to remove this milestone from all issues in the project.
    return null;
  },
};

export const subscriptions = {
  milestoneChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([Channels.MILESTONE_CHANGE]),
      (
        { value }: MilestoneRecordChange,
        { project }: MilestoneChangedSubscriptionArgs,
        context: Context) => {
        return context.user && value.project.equals(project);
      }
    ),
    resolve: (payload: MilestoneRecordChange) => {
      return payload;
    },
  },
};

export const types = {
  Milestone: {
    id(row: MilestoneRecord) { return row._id; },
    creator: (row: MilestoneRecord) => row.creator.toHexString(),
    createdAt: (row: MilestoneRecord) => row.created,
    updatedAt: (row: MilestoneRecord) => row.updated,
  },
};
