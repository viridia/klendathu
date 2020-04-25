// import { CustomValues } from 'klendathu-json-types';
import { ObjectID } from 'mongodb';
import { IssueID, LabelID } from './ids';

/** Data for a custom field. */
export type CustomData = string | number | boolean;

/** Data for a custom field. */
export interface CustomValues {
  [name: string]: string | number | boolean;
}

/** Information about a file attachment to an issue. */
export interface Attachment {
  id: ObjectID;
  filename: string;
  url: string;
  thumbnail?: string;
  type: string;
}

// Database representation of an issue
export interface IssueRecord {
  _id: IssueID; // <owner.index>
  deleted?: boolean;
  project: ObjectID;
  type: string;
  state: string;
  summary: string;
  description: string;
  reporter: ObjectID;
  reporterSort: string;
  owner?: ObjectID;
  ownerSort: string;
  watchers: ObjectID[];
  created: Date;
  updated: Date;
  labels: LabelID[];
  custom: CustomValues;
  attachments: Attachment[];
  isPublic?: boolean;
  position?: [number, number];
  milestone?: ObjectID;
  sprints?: ObjectID[];
}
