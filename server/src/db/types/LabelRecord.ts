export interface LabelRecord {
  _id: string; // account/project/index
  project: string; // account/project
  name: string;
  color: string;
  creator: string;
  created: Date;
  updated: Date;
}
