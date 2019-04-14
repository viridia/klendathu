import { ChangeAction } from '../../../common/types/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';
// import { server } from '../Server';

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

let pubsub: RedisPubSub;

export function publish<T>(channel: string, change: RecordChange<T>) {
  if (pubsub) {
    pubsub.publish(channel, change);
  }
}

export function initRedisPubSub() {
  const redisOptions = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  };

  pubsub = new RedisPubSub({
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions),
  });
}

export function closePubSub() {
  pubsub.close();
}

export function getPubSub() {
  return pubsub;
}
