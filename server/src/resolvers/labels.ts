import { LabelRecord } from '../db/types';
import { Context } from './Context';
import {
  LabelQueryArgs,
  NewLabelMutationArgs,
  UpdateLabelMutationArgs,
  DeleteLabelMutationArgs,
  LabelsQueryArgs,
  ChangeAction,
  LabelChangedSubscriptionArgs,
} from '../../../common/types/graphql';
import { escapeRegExp } from '../db/helpers';
import { ObjectID } from 'mongodb';
import { AuthenticationError, UserInputError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { logger } from '../logger';
import { getProjectAndRole } from '../db/role';
import { Channels, publish, RecordChange, getPubSub } from './pubsub';
import { withFilter } from 'graphql-subscriptions';

type LabelRecordChange = RecordChange<LabelRecord>;

export const queries = {
  label(_: any, { id }: LabelQueryArgs, context: Context): Promise<LabelRecord> {
    return context.labels.findOne({ _id: id });
  },

  async labels(
      _: any,
      { project, search }: LabelsQueryArgs,
      context: Context): Promise<LabelRecord[]> {
    const query: any = { project: new ObjectID(project), deleted: { $ne: true } };
    if (search) {
      const pattern = `(?i)\\b${escapeRegExp(search)}`;
      query.name = { $regex: pattern };
    }
    return context.labels.find(query).toArray();
  },
};

export const mutations = {
  async newLabel(
      _: any,
      { project, input }: NewLabelMutationArgs,
      context: Context): Promise<LabelRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project: pr, role } =
      await getProjectAndRole(context.db, context.user, new ObjectID(project));
    if (!pr) {
      logger.error('Attempt to create label for non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to create label:', { user, project });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // Compute next issue id.
    const p = await context.projects.findOneAndUpdate(
      { _id: pr._id },
      { $inc: { labelIdCounter: 1 } });

    const now = new Date();
    const record: LabelRecord = {
      _id: `${pr._id}.${p.value.labelIdCounter}`,
      project: pr._id,
      name: input.name,
      color: input.color,
      creator: context.user._id,
      created: now,
      updated: now,
    };

    const result = await context.labels.insertOne(record as any);
    publish(`${Channels.LABEL_CHANGE}.${pr._id.toHexString()}`, {
      action: ChangeAction.Added,
      value: result.ops[0],
    });
    return result.ops[0];
  },

  async updateLabel(
      _: any,
      { id, input }: UpdateLabelMutationArgs,
      context: Context): Promise<LabelRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const label = await context.labels.findOne({ _id: id, deleted: { $ne: true } });
    if (!label) {
      logger.error('Attempt to update non-existent label:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, label.project);
    if (!project) {
      logger.error('Attempt to update label for non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to update label:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const now = new Date();
    const record: Partial<LabelRecord> = {
      name: input.name,
      color: input.color,
      updated: now,
    };

    const result = await context.labels.findOneAndUpdate({ _id: id }, { $set: record });
    publish(`${Channels.LABEL_CHANGE}.${project._id.toHexString()}`, {
      action: ChangeAction.Changed,
      value: result.value,
    });
    return result.value;
  },

  async deleteLabel(
    _: any,
    { id }: DeleteLabelMutationArgs,
    context: Context): Promise<LabelRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;
    const label = await context.labels.findOne({ _id: id, deleted: { $ne: true } });
    if (!label) {
      logger.error('Attempt to delete non-existent label:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(context.db, context.user, label.project);
    if (!project) {
      logger.error('Attempt to delete label for non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.UPDATER) {
      logger.error('Insufficient permissions to delete label:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // TODO: Implement
    // We need to remove this label from all issues in the project.
    // And make a timeline entry record for each of those issues.
    return null;
  },
};

export const subscriptions = {
  labelChanged: {
    subscribe: withFilter(
      (_, args: LabelChangedSubscriptionArgs) =>
        getPubSub().asyncIterator(`${Channels.LABEL_CHANGE}.${args.project}`),
      (
        change: LabelRecordChange,
        args: LabelChangedSubscriptionArgs,
        context: Context) => {
        return !!context.user;
      }
    ),
    resolve: (payload: LabelRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
};

export const types = {
  Label: {
    id(row: LabelRecord) { return row._id; },
  },
};
