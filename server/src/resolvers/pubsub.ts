import { PubSub } from 'graphql-subscriptions';

export enum Channels {
  ISSUE_CHANGE = 'issue-change',
  TIMELINE_CHANGE = 'timeline-change',
}

export const pubsub = new PubSub();
