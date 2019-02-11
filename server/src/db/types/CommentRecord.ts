import { ObjectID } from 'mongodb';

export interface CommentRecord {
  /** Comment ID. */
  _id?: ObjectID;

  /** Project owning this comment. */
  project: ObjectID;

  /** Issue this comment is attached to. */
  issue: string;

  /** User that created this comment. */
  author?: ObjectID;

  /** Body of the comment. */
  body: string;

  /** Date and time when the comment was posted. */
  created: Date;

  /** Date and time when the comment was last edited. */
  updated: Date;
}
