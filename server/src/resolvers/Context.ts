import { Db, Collection } from 'mongodb';
import {
  AccountRecord,
  ProjectRecord,
  IssueRecord,
  LabelRecord,
  MilestoneRecord,
  TimelineEntryRecord,
  ProjectPrefsRecord,
  MembershipRecord,
} from '../db/types';

export class Context {
  constructor(public db: Db, public user?: AccountRecord) {}

  public get accounts(): Collection<AccountRecord> {
    return this.db.collection<AccountRecord>('accounts');
  }

  public get issues(): Collection<IssueRecord> {
    return this.db.collection<IssueRecord>('issues');
  }

  public get labels(): Collection<LabelRecord> {
    return this.db.collection<LabelRecord>('labels');
  }

  public get memberships(): Collection<MembershipRecord> {
    return this.db.collection<MembershipRecord>('memberships');
  }

  public get milestones(): Collection<MilestoneRecord> {
    return this.db.collection<MilestoneRecord>('milestones');
  }

  public get projects(): Collection<ProjectRecord> {
    return this.db.collection<ProjectRecord>('projects');
  }

  public get projectPrefs(): Collection<ProjectPrefsRecord> {
    return this.db.collection<ProjectPrefsRecord>('projectPrefs');
  }

  public get timeline(): Collection<TimelineEntryRecord> {
    return this.db.collection<TimelineEntryRecord>('timeline');
  }
}
