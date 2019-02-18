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
  filename: string;
  url: string;
  thumbnail?: string;
  type: string;
}

// Database representation of an issue
export interface IssueRecord {
  _id: IssueID; // <owner.index>
  project: ObjectID;
  type: string;
  state: string;
  summary: string;
  description: string;
  reporter: ObjectID;
  reporterSort: string;
  owner?: ObjectID;
  ownerSort: string;
  cc: ObjectID[];
  created: Date;
  updated: Date;
  labels: LabelID[];
  custom: CustomValues;
  // comments: CommentEntry[];
  attachments: Attachment[];
  isPublic?: boolean;
  position?: [number, number];
  milestone?: string;
}
