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
import { pubsub } from './pubsub';
import { withFilter } from 'graphql-subscriptions';

const LABEL_CHANGE = 'label-change';

interface LabelRecordChange {
  label: LabelRecord;
  action: ChangeAction;
}

export const queries = {
  label(_: any, { id }: LabelQueryArgs, context: Context): Promise<LabelRecord> {
    const labels = context.db.collection('labels');
    return labels.findOne({ _id: id });
  },

  async labels(
      _: any,
      { project, search }: LabelsQueryArgs,
      context: Context): Promise<LabelRecord[]> {
    const query: any = { project: new ObjectID(project) };
    if (search) {
      const pattern = `(?i)\\b${escapeRegExp(search)}`;
      query.name = { $regex: pattern };
    }
    return context.db.collection('labels').find<LabelRecord>(query).toArray();
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
    const { project : pr, role } =
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
    const p = await context.db.collection('projects').findOneAndUpdate(
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

    const result = await context.db.collection('labels').insertOne(record);
    pubsub.publish(LABEL_CHANGE, {
      action: ChangeAction.Added,
      label: result.ops[0],
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
    const label = await context.db.collection('labels').findOne<LabelRecord>({ _id: id });
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

    const result = await context.db.collection('labels')
        .findOneAndUpdate({ _id: id }, { $set: record });
    pubsub.publish(LABEL_CHANGE, {
      action: ChangeAction.Changed,
      label: result.value,
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
    const label = await context.db.collection('labels').findOne<LabelRecord>({ _id: id });
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
    return null;
  },
};

export const subscriptions = {
  labelChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([LABEL_CHANGE]),
      (
        { label }: LabelRecordChange,
        { project: id }: LabelChangedSubscriptionArgs,
        context: Context) => {
        return context.user && label.project.equals(id);
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
