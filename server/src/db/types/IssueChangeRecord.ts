import { ObjectID } from 'mongodb';
import {
  LinkChange,
  CustomFieldChange,
  StringChange,
} from '../../../../common/types/graphql';
import { IssueID } from './ids';

export interface ObjectIDChange {
  before?: ObjectID;
  after?: ObjectID;
}

export interface ObjectIDListChange {
  added: ObjectID[];
  removed: ObjectID[];
}

export interface IssueChangeRecord {
  _id?: ObjectID;
  issue: IssueID;
  project: ObjectID;
  by: ObjectID;
  at: Date;
  type?: StringChange;
  state?: StringChange;
  summary?: StringChange;
  description?: StringChange;
  owner?: ObjectIDChange;
  cc?: ObjectIDListChange;
  labels?: ObjectIDListChange;
  milestone?: StringChange;
  attachments?: {
    added?: string[];
    removed?: string[];
  };
  commentBody?: string;
  commentUpdated?: Date;
  commentRemoved?: Date;
  custom?: CustomFieldChange[];
  linked?: LinkChange[];
}
