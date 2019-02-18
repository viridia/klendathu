import { ObjectID } from 'mongodb';
import { IssueID } from './ids';

export interface CommentRecord {
  /** Comment ID. */
  _id?: ObjectID;

  /** Project owning this comment. */
  project: ObjectID;

  /** Issue this comment is attached to. */
  issue: IssueID;

  /** User that created this comment. */
  author?: ObjectID;

  /** Body of the comment. */
  body: string;

  /** Date and time when the comment was posted. */
  created: Date;

  /** Date and time when the comment was last edited. */
  updated: Date;
}
