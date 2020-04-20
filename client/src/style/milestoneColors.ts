import { TimeboxStatus } from '../../../common/types/graphql';

export const MilestoneColors = {
  ACTIVE: '#eea',
  TIMELESS: '#dcd',
  PENDING: '#aea',
  CONCLUDED: '#ccf',
};

export const timeboxStateColors: { [id: string]: string } = {
  active: MilestoneColors.ACTIVE,
  timeless: MilestoneColors.TIMELESS,
  pending: MilestoneColors.PENDING,
  concluded: MilestoneColors.CONCLUDED,
};

export const timeboxBgColors: { [id: string]: string } = {
  [TimeboxStatus.Active]: '#e2d000',
  [TimeboxStatus.Timeless]: '#9d8fa2',
  [TimeboxStatus.Pending]: '#60a260',
  [TimeboxStatus.Concluded]: '#696eab',
};
