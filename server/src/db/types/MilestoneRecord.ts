import { MilestoneStatus } from '../../../../common/types/graphql';
import { ObjectID } from 'mongodb';

export interface MilestoneRecord {
  _id?: string;
  project: ObjectID;
  name: string;
  status: MilestoneStatus;
  description: string;
  startDate: Date;
  endDate: Date;
  created: Date;
  updated: Date;
  creator: ObjectID;
}
