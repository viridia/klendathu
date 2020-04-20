import { TimeboxStatus, TimeboxType } from '../../../../common/types/graphql';
import { ObjectID } from 'mongodb';

export interface TimeboxRecord {
  _id?: string;
  project: ObjectID;
  name: string;
  type: TimeboxType;
  status: TimeboxStatus;
  description: string;
  startDate: Date;
  endDate: Date;
  created: Date;
  updated: Date;
  createdBy: ObjectID;
}
