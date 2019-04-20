import { Context } from './Context';
import { TimelineEntryRecord, IssueRecord } from '../db/types';
import {
  IssuesChangedSubscriptionArgs,
  IssueChangedSubscriptionArgs,
  TimelineChangedSubscriptionArgs,
} from '../../../common/types/graphql';
import { withFilter } from 'graphql-subscriptions';
import { Channels, RecordChange, getPubSub } from './pubsub';
import { ObjectID } from 'mongodb';
import { getCachedProjectRole } from '../db/role';
import { Role } from '../../../common/types/json';

type IssueRecordChange = RecordChange<IssueRecord>;
type TimelineRecordChange = RecordChange<TimelineEntryRecord>;

export const subscriptions = {
  issueChanged: {
    subscribe: withFilter(
      () => getPubSub().asyncIterator(Channels.ISSUE_CHANGE),
      async (
        change: IssueRecordChange,
        { issue }: IssueChangedSubscriptionArgs,
        context: Context
      ) => {
        const role = await getCachedProjectRole(context.user, new ObjectID(change.value.project));
        return role > Role.NONE && change.value._id === issue;
      }
    ),
    resolve: (payload: IssueRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
  issuesChanged: {
    subscribe: withFilter(
      () => getPubSub().asyncIterator(Channels.ISSUE_CHANGE),
      async (
        change: IssueRecordChange,
        { project }: IssuesChangedSubscriptionArgs,
        context: Context
      ) => {
        const projectId = new ObjectID(change.value.project);
        if (!projectId.equals(project)) {
          return false;
        }
        const role = await getCachedProjectRole(context.user, projectId);
        return role > Role.NONE;
      }
    ),
    resolve: (payload: IssueRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
  timelineChanged: {
    subscribe: withFilter(
      () => getPubSub().asyncIterator([Channels.TIMELINE_CHANGE]),
      async (
        change: TimelineRecordChange,
        { issue, project }: TimelineChangedSubscriptionArgs,
        context: Context
      ) => {
        const projectId = new ObjectID(change.value.project);
        if (!projectId.equals(project)) {
          return false;
        }

        const role = await getCachedProjectRole(context.user, projectId);
        if (role === Role.NONE) {
          return false;
        } else if (issue) {
          return change.value.issue === issue;
        } else {
          return true;
        }
      }
    ),
    resolve: (payload: TimelineRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
};
