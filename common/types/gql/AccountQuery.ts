/* tslint:disable */
// This file was automatically generated and should not be edited.

import { AccountType } from "./globalTypes";

// ====================================================
// GraphQL query operation: AccountQuery
// ====================================================

export interface AccountQuery_account {
  __typename: "Account";
  /**
   * Database id this user or organization.
   */
  id: string;
  /**
   * Unique, user-visible account name of this user or organization.
   */
  accountName: string;
  /**
   * Display name of this user or organization.
   */
  display: string;
  /**
   * Whether this is a person or an organization.
   */
  type: AccountType;
  /**
   * Profile photo (URL).
   */
  photo: string | null;
  /**
   * Whether this account has been verified. Non-verified accounts have limited access.
   */
  verified: boolean;
}

export interface AccountQuery {
  /**
   * Access an account either by the account name or by the database id.
   */
  account: AccountQuery_account | null;
}
