import { CustomValues } from 'klendathu-json-types';

// Database representation of an issue
export interface IssueRecord {
  _id: string; // account/project/index
  project: string;
  type: string;
  state: string;
  summary: string;
  description: string;
  reporter: string;
  reporterSort: string;
  owner: string;
  ownerSort: string;
  cc: string[];
  created: Date;
  updated: Date;
  labels: string[];
  custom: CustomValues;
  // comments: CommentEntry[];
  attachments: string[];
  isPublic?: boolean;
  position?: [number, number];
  milestone?: string;
}
