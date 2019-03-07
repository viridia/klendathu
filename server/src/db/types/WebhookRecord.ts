import { ObjectID } from 'mongodb';

export interface WebhookRecord {
  _id?: ObjectID;
  project: ObjectID;
  serviceId: string;
  secret: string;
  created: Date;
  updated: Date;
}
