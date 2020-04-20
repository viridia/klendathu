import { ObjectID } from 'mongodb';
import {
  LinkChange,
  CustomFieldChange,
  StringChange,
} from '../../../../common/types/graphql';
import { Attachment } from './IssueRecord';
import { IssueID } from './ids';

export interface ObjectIDChange {
  before?: ObjectID;
  after?: ObjectID;
}

export interface ObjectIDListChange {
  added: ObjectID[];
  removed: ObjectID[];
}

export interface StringListChange {
  added: string[];
  removed: string[];
}

export interface TimelineEntryRecord {
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
  watchers?: ObjectIDListChange;
  labels?: StringListChange;
  milestone?: StringChange;
  sprints?: ObjectIDListChange;
  attachments?: {
    added?: Attachment[];
    removed?: Attachment[];
  };
  commentBody?: string;
  commentUpdated?: Date;
  commentRemoved?: Date;
  custom?: CustomFieldChange[];
  linked?: LinkChange[];
}
