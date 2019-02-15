import { ProjectPrefsRecord } from '../db/types';
import { Context } from './Context';
import {
  SetPrefColumnsMutationArgs,
  ProjectPrefsQueryArgs,
  AddPrefsFilterMutationArgs,
  RemovePrefsFilterMutationArgs,
  AddPrefsLabelMutationArgs,
  RemovePrefsLabelMutationArgs,
  PrefsChangedSubscriptionArgs,
  ChangeAction,
} from '../../../common/types/graphql';
import { ObjectID } from 'mongodb';
import { AuthenticationError } from 'apollo-server-core';
import { Errors } from '../../../common/types/json';
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './pubsub';

const DefaultColumns: string[] = [
  'type',
  'owner',
  'state',
];

const PREFS_CHANGE = 'prefs-change';

interface PrefsRecordChange {
  prefs: ProjectPrefsRecord;
  action: ChangeAction;
}

function signalPrefsChanged(prefs: ProjectPrefsRecord) {
  pubsub.publish(PREFS_CHANGE, {
    action: ChangeAction.Changed,
    prefs,
  });
}

export const queries = {
  async projectPrefs(
      _: any,
      { project }: ProjectPrefsQueryArgs,
      context: Context): Promise<ProjectPrefsRecord> {
    if (!context.user) {
      return {
        user: null,
        project: new ObjectID(project),
      };
    }
    const prefs = await context.db.collection('projectPrefs')
      .findOne<ProjectPrefsRecord>({ user: context.user._id, project: new ObjectID(project) });
    if (!prefs) {
      return {
        user: context.user._id,
        project: new ObjectID(project),
      };
    }

    return prefs;
  },
};

export const mutations = {
  async setPrefColumns(
      _: any,
      { project, columns }: SetPrefColumnsMutationArgs,
      context: Context): Promise<ProjectPrefsRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const pid = new ObjectID(project);
    const result = await context.db.collection('projectPrefs')
      .findOneAndUpdate(
        { user: context.user._id, project: pid },
        {
          $setOnInsert: { user: context.user._id, project: pid },
          $set: { columns },
        },
        {
          upsert: true,
          // returnNewDocument: true,
        }) as any;
    signalPrefsChanged(result.value);
    return result.value;
  },

  async addPrefsLabel(
      _: any,
      { project, label }: AddPrefsLabelMutationArgs,
      context: Context): Promise<ProjectPrefsRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const pid = new ObjectID(project);
    const result = await context.db.collection<ProjectPrefsRecord>('projectPrefs')
      .findOneAndUpdate(
        { user: context.user._id, project: pid },
        {
          $setOnInsert: { user: context.user._id, project: pid },
          $addToSet: { labels: label },
        },
        {
          upsert: true,
          returnOriginal: false,
        }) as any;
    signalPrefsChanged(result.value);
    return result.value;
  },

  async removePrefsLabel(
      _: any,
      { project, label }: RemovePrefsLabelMutationArgs,
      context: Context): Promise<ProjectPrefsRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const pid = new ObjectID(project);
    const result = await context.db.collection('projectPrefs')
      .findOneAndUpdate(
        { user: context.user._id, project: pid },
        {
          $setOnInsert: { user: context.user._id, project: pid },
          $pull: { labels: label },
        },
        {
          upsert: true,
          returnOriginal: false,
        }) as any;
    signalPrefsChanged(result.value);
    return result.value;
  },

  async addPrefsFilter(
      _: any,
      { project, input }: AddPrefsFilterMutationArgs,
      context: Context): Promise<ProjectPrefsRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const pid = new ObjectID(project);
    const result = await context.db.collection('projectPrefs')
      .findOneAndUpdate(
        { user: context.user._id, project: pid },
        {
          $setOnInsert: { user: context.user._id, project: pid },
          $push: { filters: input },
        },
        {
          upsert: true,
          returnOriginal: false,
        }) as any;
    signalPrefsChanged(result.value);
    return result.value;
  },

  async removePrefsFilter(
      _: any,
      { project, name }: RemovePrefsFilterMutationArgs,
      context: Context): Promise<ProjectPrefsRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const pid = new ObjectID(project);
    const result = await context.db.collection('projectPrefs')
      .findOneAndUpdate(
        { user: context.user._id, project: pid },
        {
          $setOnInsert: { user: context.user._id, project: pid },
          $pull: { filters: { name } },
        },
        {
          upsert: true,
          returnOriginal: false,
        }) as any;
    signalPrefsChanged(result.value);
    return result.value;
  },
};

export const subscriptions = {
  prefsChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([PREFS_CHANGE]),
      (
        { prefs }: PrefsRecordChange,
        { project: id }: PrefsChangedSubscriptionArgs,
        context: Context) => {
        return context.user && prefs.project.equals(id) && prefs.user.equals(context.user._id);
      }
    ),
    resolve: (payload: PrefsRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
};

export const types = {
  ProjectPrefs: {
    columns(row: ProjectPrefsRecord) {
      return row.columns !== undefined ? row.columns : DefaultColumns;
    },
    labels(row: ProjectPrefsRecord) {
      return row.labels !== undefined ? row.labels : [];
    },
    filters(row: ProjectPrefsRecord) {
      return row.filters !== undefined ? row.filters : [];
    },
  },
};
