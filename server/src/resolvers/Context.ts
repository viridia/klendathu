import { Db, Collection } from 'mongodb';
import {
  AccountRecord,
  ProjectRecord,
  IssueRecord,
  LabelRecord,
  TimeboxRecord,
  TimelineEntryRecord,
  ProjectPrefsRecord,
  MembershipRecord,
  IssueLinkRecord,
} from '../db/types';

export class Context {
  constructor(public db: Db, public user?: AccountRecord) {}

  public get accounts(): Collection<AccountRecord> {
    return this.db.collection<AccountRecord>('accounts');
  }

  public get issues(): Collection<IssueRecord> {
    return this.db.collection<IssueRecord>('issues');
  }

  public get issueLinks(): Collection<IssueLinkRecord> {
    return this.db.collection<IssueLinkRecord>('issueLinks');
  }

  public get labels(): Collection<LabelRecord> {
    return this.db.collection<LabelRecord>('labels');
  }

  public get memberships(): Collection<MembershipRecord> {
    return this.db.collection<MembershipRecord>('memberships');
  }

  public get sprints(): Collection<TimeboxRecord> {
    return this.db.collection<TimeboxRecord>('sprints');
  }

  public get timeboxes(): Collection<TimeboxRecord> {
    return this.db.collection<TimeboxRecord>('timeboxes');
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
