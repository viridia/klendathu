export type Maybe<T> = T | null;

/** Query params for searching for issues. */
export interface IssueQueryParams {
  /** ID of the project containing the issues being queried. */
  project: string;
  /** Text search string. */
  search?: Maybe<string>;
  /** Query term that restricts the issue search to a set of types. */
  type?: Maybe<string[]>;
  /** Query term that restricts the issue search to a set of states. */
  state?: Maybe<string[]>;
  /** Query term that restricts the issue search to a set of owners. */
  owner?: Maybe<string[]>;
  /** Query term that restricts the issue search to a set of reporters. */
  reporter?: Maybe<string[]>;
  /** Query term that restricts the issue search to a set of CCs. */
  cc?: Maybe<(Maybe<string>)[]>;
  /** Query term that searches the summary field. */
  summary?: Maybe<string>;
  /** Search predicate for the summary field. */
  summaryPred?: Maybe<Predicate>;
  /** Query term that searches the description field. */
  description?: Maybe<string>;
  /** Search predicate for the description field. */
  descriptionPred?: Maybe<Predicate>;
  /** Query term that restricts the issue search to a set of label ids. */
  labels?: Maybe<string[]>;
  /** Specifies a list of linked issues to search for. */
  linked?: Maybe<string[]>;
  /** Query term that searches the issue comments. */
  comment?: Maybe<string>;
  /** 'Search predicate for the comments */
  commentPred?: Maybe<Predicate>;

  custom?: Maybe<CustomSearchInput[]>;
  /** Query term that specifies the field sort order */
  sort?: Maybe<string[]>;
  /** Whether to show issues hierarchically (subtasks) */
  subtasks?: Maybe<boolean>;
}
/** Query params for searching for issues via custom fields. */
export interface CustomSearchInput {
  name: string;

  value?: Maybe<string>;

  values?: Maybe<string[]>;
}
/** Pagination params. */
export interface Pagination {
  /** Limit on how many documents to retrieve */
  limit?: Maybe<number>;
  /** Offset of starting document */
  offset?: Maybe<number>;
}
/** Data type for creating or updating an account. */
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
/** Data type for creating or updating a project. */
export interface ProjectInput {
  /** Short description of the project. */
  title: string;
  /** A more detailed description of the project. */
  description: string;
  /** Issue template for this project. */
  template?: Maybe<string>;
  /** If true, indicates that this project is visible to the public. */
  isPublic: boolean;
}
/** A label which can be attached to an issue. */
export interface LabelInput {
  /** Text of the label. */
  name: string;
  /** CSS color of the label. */
  color: string;
}
/** Type for posting a new issue. */
export interface IssueInput {
  /** Issue type (defined by template). */
  type: string;
  /** Current workflow state. */
  state: string;
  /** One-line summary of the issue. */
  summary: string;
  /** Detailed description of the issue. */
  description: string;
  /** Username of current owner of this issue. */
  owner?: Maybe<string>;
  /** Users who wish to be informed when this issue is updated. */
  cc?: Maybe<string[]>;
  /** Labels associated with this issue. */
  labels?: Maybe<string[]>;
  /** List of custom fields for this issue. */
  custom?: Maybe<CustomFieldInput[]>;
  /** List of attachments. */
  attachments?: Maybe<AttachmentInput[]>;
  /** Whether this issue should be visible to non-members of the project. */
  isPublic?: Maybe<boolean>;
  /** X / Y position of issue in mural view. */
  position?: Maybe<CoordInput>;
  /** Milestone that we plan to address this issue in. */
  milestone?: Maybe<string>;
  /** List of issues linked to this one. */
  linked?: Maybe<IssueLinkInput[]>;
  /** List of comments. */
  comments?: Maybe<string[]>;
}
/** Input for a custom field. */
export interface CustomFieldInput {
  key: string;

  value?: Maybe<CustomValue>;
}
/** File attachment input. */
export interface AttachmentInput {
  filename: string;

  url: string;

  thumbnail?: Maybe<string>;

  type: string;
}
/** Represents a 2D coordinate Input. */
export interface CoordInput {
  x: number;

  y: number;
}
/** Defines a relationship between one issue and another. */
export interface IssueLinkInput {
  /** ID of issue to which this is linked [projectId.id]. */
  to: string;
  /** Type of the relation. */
  relation: Relation;
}
/** Used for setting filters. */
export interface FilterInput {
  /** Name of this filter. */
  name: string;
  /** JSON-encoded filter expression. */
  value: string;
  /** Which view this was (issues, progress, etc.). */
  view?: Maybe<string>;
}
/** Used for adding / removing labels, cc users, attachments. */
export interface IssueEdit {
  addCC?: Maybe<string[]>;

  removeCC?: Maybe<string[]>;

  addLabels?: Maybe<string[]>;

  removeLabels?: Maybe<string[]>;

  addAttachments?: Maybe<AttachmentInput[]>;

  removeAttachments?: Maybe<string[]>;
}
/** Input for milestone */
export interface MilestoneInput {
  /** Title of this milestone */
  name: string;
  /** Current status */
  status: MilestoneStatus;
  /** Milestone description */
  description: string;
  /** Planned start date of milestone */
  startDate?: Maybe<DateTime>;
  /** Planned end date of milestone */
  endDate?: Maybe<DateTime>;
}
/** Type of account: user account or organizational account. */
export enum AccountType {
  User = "USER",
  Organization = "ORGANIZATION"
}
/** Relation between two issues */
export enum Relation {
  BlockedBy = "BLOCKED_BY",
  Blocks = "BLOCKS",
  PartOf = "PART_OF",
  HasPart = "HAS_PART",
  Duplicate = "DUPLICATE",
  Related = "RELATED"
}
/** Search predicates */
export enum Predicate {
  In = "IN",
  Contains = "CONTAINS",
  Equals = "EQUALS",
  Match = "MATCH",
  NotIn = "NOT_IN",
  NotContains = "NOT_CONTAINS",
  NotEquals = "NOT_EQUALS",
  NotMatch = "NOT_MATCH",
  StartsWith = "STARTS_WITH",
  EndsWith = "ENDS_WITH",
  Greater = "GREATER",
  GreaterEqual = "GREATER_EQUAL",
  Less = "LESS",
  LessEqual = "LESS_EQUAL",
  HasAny = "HAS_ANY",
  HasAll = "HAS_ALL"
}

export enum ChangeAction {
  Added = "ADDED",
  Changed = "CHANGED",
  Removed = "REMOVED"
}

export enum CacheControlScope {
  Public = "PUBLIC",
  Private = "PRIVATE"
}
/** Status of a milestone */
export enum MilestoneStatus {
  Pending = "PENDING",
  Active = "ACTIVE",
  Concluded = "CONCLUDED",
  Timeless = "TIMELESS"
}

/** Date and time */
export type DateTime = any;

/** JSON object that has it's own schema */
export type JsonObject = any;

/** Used to represent custom field values. Can be a string, integer or boolean. */
export type CustomValue = any;

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
  /** Access a project by account/project name or by id. */
  project?: Maybe<Project>;
  /** Access a project by owner name and project. Returns project, account and members. */
  projectContext?: Maybe<ProjectContext>;
  /** Return a lists of all projects that the user belongs to. */
  projects: Project[];
  /** Return a list of all project members. */
  projectMembers: Membership[];
  /** Look up a template by name. */
  template?: Maybe<JsonObject>;
  /** Retrieve a label by id. */
  label?: Maybe<Label>;
  /** Retrieve labels from a project, with optional search token. */
  labels: Label[];
  /** Retrieve an issue by id. */
  issue?: Maybe<Issue>;
  /** Retrieve issues which meet a set of filter criteria. */
  issues: PaginatedIssues;
  /** Search for issues by text query, sorted by relevance. */
  issueSearch: Issue[];
  /** Retrieve history of changes to an issue, or all issues within a project. */
  issueChanges: PaginatedIssueChanges;
  /** Search custom field text, used for auto completion. */
  searchCustomFields: string[];
  /** Current user's preferences for a project. */
  projectPrefs: ProjectPrefs;
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

/** Project record. */
export interface Project {
  /** Unique ID of this project. */
  id: string;
  /** Account that owns this project. */
  owner: string;
  /** Denormalized owner name. */
  ownerName: string;
  /** Unique name of this project within an account. */
  name: string;
  /** Short description of the project. */
  title: string;
  /** A more detailed description of the project. */
  description: string;
  /** When this project was created. */
  createdAt: DateTime;
  /** When this project was last updated. */
  updatedAt: DateTime;
  /** Issue template for this project. */
  template?: Maybe<string>;
  /** If true, indicates that this project is visible to the public. */
  isPublic: boolean;
  /** Role of current user with respect to this project. */
  role?: Maybe<number>;
}

/** Query result that returns project, owner account and memberships in a single operation. */
export interface ProjectContext {
  /** Project record */
  project: Project;
  /** Account that owns the project */
  account: PublicAccount;
  /** Current user's project preferences */
  prefs: ProjectPrefs;
  /** Templates for this project */
  template: JsonObject;
}

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface ProjectPrefs {
  /** Database id of user */
  user: string;
  /** Database id of project */
  project: string;
  /** List of columns to display in the issue list. */
  columns: string[];
  /** List of label names to display in the issue summary list. */
  labels: string[];
  /** List of saved filters. */
  filters: Filter[];
}

/** One of the user's saved filters. */
export interface Filter {
  /** Name of this filter. */
  name: string;
  /** JSON-encoded filter expression. */
  value: string;
  /** Which view this was (issues, progress, etc.). */
  view?: Maybe<string>;
}

/** A label which can be attached to an issue. */
export interface Label {
  /** Database id for this label [account/project/id]. */
  id: string;
  /** Text of the label. */
  name: string;
  /** CSS color of the label. */
  color: string;
  /** Project in which this label is defined. */
  project: string;
  /** User that created this label. */
  creator: string;
  /** When the label was created. */
  created: DateTime;
  /** When the label was last updated. */
  updated: DateTime;
}

/** An issue. */
export interface Issue {
  /** Unique id of this issue. [projectId.issueNum] */
  id: string;
  /** Date and time when the issue was created. */
  createdAt: DateTime;
  /** Date and time when the issue was last changed. */
  updatedAt: DateTime;
  /** Issue type (defined by template). */
  type: string;
  /** Current workflow state. */
  state: string;
  /** ID of the project this issue belongs to (owner/id). */
  project: string;
  /** Username of user that originally reported this issue. */
  reporter: string;
  /** Account of reporter of this issue. */
  reporterAccount: PublicAccount;
  /** Sort key for sorting by reporters. */
  reporterSort?: Maybe<string>;
  /** One-line summary of the issue. */
  summary: string;
  /** Detailed description of the issue. */
  description: string;
  /** Username of current owner of this issue. */
  owner?: Maybe<string>;
  /** Sort key for sorting by owners. */
  ownerSort?: Maybe<string>;
  /** Account of current owner of this issue. */
  ownerAccount?: Maybe<PublicAccount>;
  /** Users who wish to be informed when this issue is updated. */
  cc: string[];
  /** Accounts of users who wish to be informed when this issue is updated. */
  ccAccounts: PublicAccount[];
  /** Labels associated with this issue. */
  labels: string[];
  /** List of custom fields for this issue. */
  custom: CustomField[];
  /** List of attachments. */
  attachments: Attachment[];
  /** Links to other issues */
  links: IssueLink[];
  /** Whether this issue should be visible to non-members of the project. */
  isPublic?: Maybe<boolean>;
  /** X / Y position of issue in mural view. */
  position?: Maybe<Coord>;
  /** Milestone that we plan to address this issue in. */
  milestone?: Maybe<string>;
}

/** Data for a custom field. */
export interface CustomField {
  key: string;

  value?: Maybe<CustomValue>;
}

/** File attachment. */
export interface Attachment {
  filename: string;

  url: string;

  thumbnail?: Maybe<string>;

  type: string;
}

/** Defines a relationship between one issue and another. */
export interface IssueLink {
  /** ID of issue to which this is linked [projectId.id]. */
  to: string;
  /** Type of the relation. */
  relation: Relation;
}

/** Represents a 2D coordinate. */
export interface Coord {
  x: number;

  y: number;
}

/** Issue query result. */
export interface PaginatedIssues {
  /** Total number of results. */
  count: number;
  /** Current offset */
  offset: number;
  /** List of results. */
  issues: Issue[];
}

/** Issue change query result. */
export interface PaginatedIssueChanges {
  /** Total number of results. */
  count: number;
  /** Current offset */
  offset: number;
  /** List of results. */
  results: IssueChangeEntry[];
}

/** A change record for an issue. */
export interface IssueChangeEntry {
  id: string;
  /** Issue this change applies to. */
  issue: string;
  /** Project containing the change. */
  project: string;
  /** ID of the user making this change. */
  by: string;
  /** Date and time when the changes were made. */
  at: DateTime;
  /** Change to the issue type. */
  type?: Maybe<StringChange>;
  /** Change to the issue state. */
  state?: Maybe<StringChange>;
  /** Change to the issue summary. */
  summary?: Maybe<StringChange>;
  /** Change to the issue description. */
  description?: Maybe<StringChange>;
  /** Change to the issue owner. */
  owner?: Maybe<IdChange>;
  /** Changes to the issue cc list. */
  cc?: Maybe<IdListChange>;
  /** Changes to the list of issue labels. */
  labels?: Maybe<IdListChange>;
  /** Changes to the issue attachment list. */
  attachments?: Maybe<IdListChange>;
  /** Changes to comments. */
  comments?: Maybe<CommentsChange>;
  /** Changes to the list of custom fields. */
  custom?: Maybe<CustomFieldChange[]>;
  /** Changes to the list of linked issues. */
  linked?: Maybe<LinkChange[]>;
}

/** A change to a string field. */
export interface StringChange {
  /** Value of the field before the change. */
  before?: Maybe<string>;
  /** Value of the field after the change. */
  after?: Maybe<string>;
}

/** A change to an ID field. */
export interface IdChange {
  /** Value of the field before the change. */
  before?: Maybe<string>;
  /** Value of the field after the change. */
  after?: Maybe<string>;
}

/** A change to a string list field. */
export interface IdListChange {
  /** List of entries that were added to the field. */
  added: string[];
  /** List of entries that were removed from the field. */
  removed: string[];
}

/** Summary of changes to comments. */
export interface CommentsChange {
  /** ID of comments that were added. */
  added: string[];
  /** Number of comments that were updated. */
  updated: string[];
  /** Number of comments that were removed. */
  removed: string[];
}

/** A change to a custom field. */
export interface CustomFieldChange {
  /** Custom field key. */
  key: string;
  /** Value of the field before the change. */
  before?: Maybe<CustomValue>;
  /** Value of the field after the change. */
  after?: Maybe<CustomValue>;
}

/** A change to a linked issue. */
export interface LinkChange {
  /** ID of the issue being linked to. */
  to: string;
  /** Relationship before the change. */
  before?: Maybe<Relation>;
  /** Relationship after the change. */
  after?: Maybe<Relation>;
}

export interface Mutation {
  /** Create a user account */
  createUserAccount?: Maybe<Account>;
  /** Create an organization account */
  createOrganizationAccount?: Maybe<Account>;
  /** Update an account */
  updateAccount?: Maybe<Account>;
  /** Create a project */
  createProject?: Maybe<Project>;
  /** Update a project */
  updateProject?: Maybe<Project>;
  /** Remove a project */
  removeProject: DeletionResult;
  /** Store a template definition by name. */
  setTemplate: JsonObject;
  /** Create a new label. */
  newLabel: Label;
  /** Update an existing label. */
  updateLabel: Label;
  /** Delete a label. */
  deleteLabel: Label;
  /** Create a new issue record. */
  newIssue: Issue;
  /** Update an existing issue record. */
  updateIssue: Issue;
  /** Delete an issue record. */
  deleteIssue: Issue;
  /** Set current user's preferences for visible columns. */
  setPrefColumns: ProjectPrefs;
  /** Add a label to the set of visible labels. */
  addPrefsLabel: ProjectPrefs;
  /** Reove a label to the set of visible labels. */
  removePrefsLabel: ProjectPrefs;
  /** Add a prefs filter. */
  addPrefsFilter: ProjectPrefs;
  /** Remove a prefs filter. */
  removePrefsFilter: ProjectPrefs;
}

export interface DeletionResult {
  id: string;
}

export interface Subscription {
  /** Signal account details have changed. Not restricted; all users can see public account details. */
  accountChanged: PublicAccount;
  /** Notify when any project within a group of project owners has been added, changed, or removed. */
  projectsChanged: ProjectChange;
  /** Watch a single project for changes. */
  projectChanged: ProjectChange;
  /** Watch the list of labels defined for a project. */
  labelChanged: LabelChange;
  /** Watch for changes to project prefs (current user). */
  prefsChanged: ProjectPrefsChange;
  /** Watch issues for a given project. */
  issuesChanged: IssueChange;
}

export interface ProjectChange {
  action: ChangeAction;

  project: Project;
}

export interface LabelChange {
  action: ChangeAction;

  label: Label;
}

export interface ProjectPrefsChange {
  action: ChangeAction;

  prefs: ProjectPrefs;
}

export interface IssueChange {
  action: ChangeAction;

  value: Issue;
}

/** Defines a relationship between one issue and another, includes both ends of the link. */
export interface IssueArc {
  /** ID of issue to which this is linked [projectId.id]. */
  to: string;
  /** ID of issue from which this is linked [projectId.id]. */
  from: string;
  /** Type of the relation. */
  relation: Relation;
}

/** Project milestone */
export interface Milestone {
  /** ID of this milestone */
  id: string;
  /** Project milestone is part of */
  project: string;
  /** Title of this milestone */
  name: string;
  /** Current status */
  status: MilestoneStatus;
  /** Milestone description */
  description: string;
  /** Planned start date of milestone */
  startDate?: Maybe<DateTime>;
  /** Planned end date of milestone */
  endDate?: Maybe<DateTime>;
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
  owner?: Maybe<string>;

  name?: Maybe<string>;

  id?: Maybe<string>;
}
export interface ProjectContextQueryArgs {
  owner: string;

  name: string;
}
export interface ProjectMembersQueryArgs {
  projectName: string;
}
export interface TemplateQueryArgs {
  owner: string;

  name: string;
}
export interface LabelQueryArgs {
  id: string;
}
export interface LabelsQueryArgs {
  project: string;

  search?: Maybe<string>;
}
export interface IssueQueryArgs {
  id: string;
}
export interface IssuesQueryArgs {
  query: IssueQueryParams;

  pagination?: Maybe<Pagination>;
}
export interface IssueSearchQueryArgs {
  project: string;

  search: string;
}
export interface IssueChangesQueryArgs {
  project: string;

  issue?: Maybe<string>;

  pagination?: Maybe<Pagination>;
}
export interface SearchCustomFieldsQueryArgs {
  project: string;

  field: string;

  search: string;
}
export interface ProjectPrefsQueryArgs {
  project: string;
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
export interface CreateProjectMutationArgs {
  owner: string;

  name: string;

  input?: Maybe<ProjectInput>;
}
export interface UpdateProjectMutationArgs {
  id: string;

  input?: Maybe<ProjectInput>;
}
export interface RemoveProjectMutationArgs {
  id: string;
}
export interface SetTemplateMutationArgs {
  owner: string;

  name: string;

  template: JsonObject;
}
export interface NewLabelMutationArgs {
  project: string;

  input: LabelInput;
}
export interface UpdateLabelMutationArgs {
  id: string;

  input: LabelInput;
}
export interface DeleteLabelMutationArgs {
  id: string;
}
export interface NewIssueMutationArgs {
  project: string;

  input: IssueInput;
}
export interface UpdateIssueMutationArgs {
  id: string;

  input: IssueInput;
}
export interface DeleteIssueMutationArgs {
  id: string;
}
export interface SetPrefColumnsMutationArgs {
  project: string;

  columns: string[];
}
export interface AddPrefsLabelMutationArgs {
  project: string;

  label: string;
}
export interface RemovePrefsLabelMutationArgs {
  project: string;

  label: string;
}
export interface AddPrefsFilterMutationArgs {
  project: string;

  input: FilterInput;
}
export interface RemovePrefsFilterMutationArgs {
  project: string;

  name: string;
}
export interface ProjectsChangedSubscriptionArgs {
  owners: string[];
}
export interface ProjectChangedSubscriptionArgs {
  project: string;
}
export interface LabelChangedSubscriptionArgs {
  project: string;
}
export interface PrefsChangedSubscriptionArgs {
  project: string;
}
export interface IssuesChangedSubscriptionArgs {
  project: string;
}
