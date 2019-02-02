import { ObjectID } from 'bson';

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface MembershipRecord {
  /** Database id of this record. */
  _id?: ObjectID;

  /** User id of project member. */
  user: ObjectID;

  /** If this is a project membership, id of project. */
  project?: ObjectID;

  /** If this is an organization membership, id of organization. */
  organization?: ObjectID;

  /** Access level for the this user (direct as project member). */
  role: number;

  /** When the member was added to the project. */
  created: Date;

  /** When the membership was last changed. */
  updated: Date;
}
