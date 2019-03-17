import { PubSub } from 'graphql-subscriptions';
import { ChangeAction } from '../../../common/types/graphql';

export interface RecordChange<T> {
  value: T;
  action: ChangeAction;
}

export enum Channels {
  ISSUE_CHANGE = 'issue-change',
  LABEL_CHANGE = 'label-change',
  MEMBERSHIP_CHANGE = 'membership-change',
  MILESTONE_CHANGE = 'milestone-change',
  PREFS_CHANGE = 'prefs-change',
  PROJECT_CHANGE = 'project-change',
  TIMELINE_CHANGE = 'timeline-change',
}

export const pubsub = new PubSub();

export function publish<T>(channel: Channels, change: RecordChange<T>) {
  pubsub.publish(channel, change);
}
