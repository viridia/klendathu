import { CustomFieldChange, ListChange, LinkChange, ScalarChange } from 'klendathu-json-types';
import { ObjectID } from 'mongodb';

export interface IssueChangeRecord {
  _id?: ObjectID;
  issue: string;
  project: ObjectID;
  by: ObjectID;
  at: Date;
  type?: ScalarChange;
  state?: ScalarChange;
  summary?: ScalarChange;
  description?: ScalarChange;
  owner?: ScalarChange;
  cc?: ListChange<string>;
  labels?: ListChange<string>;
  milestone?: ScalarChange;
  attachments?: {
    added?: string[];
    removed?: string[];
  };
  comments?: {
    added: number;
    updated: number;
    removed: number;
  };
  custom?: CustomFieldChange[];
  linked?: LinkChange[];
}
