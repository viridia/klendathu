import { ObjectID } from 'mongodb';

export interface Committer {
  name?: string;
  username?: string;
  email?: string;
}

export interface CommitRecord {
  _id?: string;
  serviceId: string;
  issue: ObjectID[];
  commit: string;
  user: Committer;
  userAccount?: ObjectID;
  submitted: boolean;
  message?: string;
  url?: string;
  created: Date;
  updated: Date;
}
