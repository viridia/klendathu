import { ObjectID } from 'mongodb';

export interface LabelRecord {
  _id?: string;
  deleted?: boolean;
  project: ObjectID; // project id
  name: string;
  color: string;
  creator: ObjectID;
  created: Date;
  updated: Date;
}
