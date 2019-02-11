// import { CustomValues } from 'klendathu-json-types';
import { ObjectID } from 'mongodb';

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
  _id: string; // <owner.index>
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
  labels: ObjectID[];
  custom: CustomValues;
  // comments: CommentEntry[];
  attachments: Attachment[];
  isPublic?: boolean;
  position?: [number, number];
  milestone?: string;
}
