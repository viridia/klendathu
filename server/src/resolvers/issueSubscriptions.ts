import { Context } from './Context';
import { TimelineEntryRecord, IssueRecord } from '../db/types';
import {
  IssuesChangedSubscriptionArgs,
  IssueChangedSubscriptionArgs,
  TimelineChangedSubscriptionArgs,
} from '../../../common/types/graphql';
import { withFilter } from 'graphql-subscriptions';
import { pubsub, Channels, RecordChange } from './pubsub';

type IssueRecordChange = RecordChange<IssueRecord>;
type TimelineRecordChange = RecordChange<TimelineEntryRecord>;

export const subscriptions = {
  issueChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([Channels.ISSUE_CHANGE]),
      (
        change: IssueRecordChange,
        { issue }: IssueChangedSubscriptionArgs,
        context: Context
      ) => {
        // TODO: Need a fast way to check project membership
        return context.user && change.value._id === issue;
      }
    ),
    resolve: (payload: IssueRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
  issuesChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([Channels.ISSUE_CHANGE]),
      (
        change: IssueRecordChange,
        { project }: IssuesChangedSubscriptionArgs,
        context: Context
      ) => {
        // TODO: Need a fast way to check project membership
        return context.user && change.value.project.equals(project);
      }
    ),
    resolve: (payload: IssueRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
  timelineChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([Channels.TIMELINE_CHANGE]),
      (
        change: TimelineRecordChange,
        { issue, project }: TimelineChangedSubscriptionArgs,
        context: Context
      ) => {
        // TODO: Need a fast way to check project membership
        if (!change.value.project.equals(project)) {
          return false;
        }
        if (issue) {
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
