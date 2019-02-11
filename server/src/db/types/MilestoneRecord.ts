import { MilestoneStatus } from '../../../../common/types/graphql';

export interface MilestoneRecord {
  _id: string;
  project: string; // account/project
  name: string;
  status: MilestoneStatus;
  description: string;
  startDate: Date;
  endDate: Date;
}
