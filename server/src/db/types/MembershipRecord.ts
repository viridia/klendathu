import { ObjectID } from 'bson';

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface MembershipRecord {
  /** Database id of this record. */
  _id?: ObjectID;

  /** User id of project member. */
  user: string;

  /** If this is a project membership, id of project. */
  project?: string;

  /** If this is an organization membership, id of organization. */
  organization?: string;

  /** Access level for the this user (direct as project member). */
  role: number;

  /** When the member was added to the project. */
  created: Date;

  /** When the membership was last changed. */
  updated: Date;
}
