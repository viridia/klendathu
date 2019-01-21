import { ObjectID } from 'bson';

/** Information about a user or organization. */
export interface AccountRecord {
  /** Record id. */
  _id?: ObjectID;

  /** Unique name of this user or organization. */
  accountName?: string;

  /** Email address if it's a user. */
  email?: string;

  /** Display name of this user or organization. */
  display: string;

  /** Whether this is a person or an organization. */
  type: 'user' | 'organization';

  /** Profile photo (URL). */
  photo?: string;

  /** Whether this account has been verified. */
  verified?: boolean;

  /** Encrypted password for email accounts. */
  password?: string;

  /** Token used for verifying email address or recovering password. */
  verificationToken?: string;
}
