export type Maybe<T> = T | null;

export interface AccountInput {
  /** Unique, user-visible account name of the account being changed. */
  accountName: string;
  /** Display name of this user or organization. */
  display?: Maybe<string>;
  /** Profile photo (URL). */
  photo?: Maybe<string>;
  /** User email address. */
  email?: Maybe<string>;
}

export enum AccountType {
  User = "USER",
  Organization = "ORGANIZATION"
}

export enum CacheControlScope {
  Public = "PUBLIC",
  Private = "PRIVATE"
}

export type DateTime = any;

/** The `Upload` scalar type represents a file upload. */
export type Upload = any;

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  /** Access an account either by the account name or by the database id. */
  account?: Maybe<PublicAccount>;
  /** Search accounts by display name or account name. */
  accounts: PublicAccount[];
  /** Return information about the current user. */
  me?: Maybe<Account>;
  /** Return a list of all organization members. */
  organizationMembers: Membership[];
  /** Access a project either by the project name or by the database id. */
  project?: Maybe<Project>;
  /** Return a lists of all projects that the user belongs to. */
  projects: Project[];
  /** Return a list of all project members. */
  projectMembers: Membership[];
}

/** Public information about a user or organization. */
export interface PublicAccount {
  /** Database id this user or organization. */
  id: string;
  /** Unique, user-visible account name of this user or organization. Null if not verified. */
  accountName?: Maybe<string>;
  /** Display name of this user or organization. */
  display: string;
  /** Whether this is a person or an organization. */
  type: AccountType;
  /** Profile photo (URL). */
  photo?: Maybe<string>;
}

/** Information about a user or organization. */
export interface Account {
  /** Database id this user or organization. */
  id: string;
  /** Unique, user-visible account name of this user or organization. Null if not verified. */
  accountName?: Maybe<string>;
  /** Display name of this user or organization. */
  display: string;
  /** Whether this is a person or an organization. */
  type: AccountType;
  /** Profile photo (URL). */
  photo?: Maybe<string>;
  /** User email address. */
  email?: Maybe<string>;
  /** Whether this account has been verified. Non-verified accounts have limited access. */
  verified: boolean;
}

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface Membership {
  /** Database id of this record. */
  id: string;
  /** User id of project member. */
  user: string;
  /** If this is a project membership, database id of project. */
  project?: Maybe<string>;
  /** If this is an organization membership, database id of organization. */
  organization?: Maybe<string>;
  /** Access level for the this user (direct as project member). */
  role?: Maybe<number>;
  /** When the member was added to the project. */
  createdAt: DateTime;
  /** When the membership was last changed. */
  updatedAt: DateTime;
}

export interface Project {
  /** Unique ID of this project [account/projectId]. */
  id: string;
  /** Short description of the project. */
  title: string;
  /** A more detailed description of the project. */
  description: string;
  /** Account that owns this project. */
  owner: string;
  /** When this project was created. */
  createdAt: DateTime;
  /** When this project was last updated. */
  updatedAt: DateTime;
  /** Issue template for this project. */
  template?: Maybe<string>;
  /** If true, indicates that this project is visible to the public. */
  isPublic: boolean;
}

export interface Mutation {
  /** Create a user account */
  createUserAccount?: Maybe<Account>;
  /** Create an organization account */
  createOrganizationAccount?: Maybe<Account>;
  /** Update an account */
  updateAccount?: Maybe<Account>;
}

// ====================================================
// Arguments
// ====================================================

export interface AccountQueryArgs {
  accountName?: Maybe<string>;

  id?: Maybe<string>;
}
export interface AccountsQueryArgs {
  token: string;

  type?: Maybe<AccountType>;
}
export interface OrganizationMembersQueryArgs {
  accountName: string;
}
export interface ProjectQueryArgs {
  projectName?: Maybe<string>;

  id?: Maybe<string>;
}
export interface ProjectMembersQueryArgs {
  projectName: string;
}
export interface CreateUserAccountMutationArgs {
  input?: Maybe<AccountInput>;
}
export interface CreateOrganizationAccountMutationArgs {
  input?: Maybe<AccountInput>;
}
export interface UpdateAccountMutationArgs {
  input?: Maybe<AccountInput>;
}
