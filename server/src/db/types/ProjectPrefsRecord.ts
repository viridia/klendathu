import { ObjectID } from 'bson';

/** One of the user's saved filters. */
export interface Filter {
  /** Name of this filter. */
  name: string;

  /** JSON-encoded filter expression. */
  value: string;

  /** Which view this was (issues, progress, etc.). */
  view?: string;
}

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface ProjectPrefsRecord {
  /** Database id of this prefs record: account/project/user */
  _id?: ObjectID;

  /** List of columns to display in the issue list. */
  columns?: string[];

  /** List of label names to display in the issue summary list. */
  labels?: string[];

  /** List of saved queries. */
  filters: Filter[];
}
