import { ObjectID } from 'mongodb';

export interface ProjectRecord {
  /** Database id of the project. */
  _id?: ObjectID;

  /** Database id of owner of this project, either user or organization. */
  owner: ObjectID;

  /** Denormalized owner name. */
  ownerName: string;

  /** Unique name of this project within an account. */
  name: string;

  /** Short description of the project. */
  title: string;

  /** A more detailed description of the project. */
  description: string;

  /** Issue template for this project. */
  template?: string;

  /** If true, indicates that this project is visible to the public. */
  isPublic: boolean;

  /** When this was created. */
  created: Date;

  /** When this was last updated. */
  updated: Date;

  /** True if this is soft deleted. */
  deleted?: boolean;

  /** Next issue id. */
  issueIdCounter: number;

  /** Next label id. */
  labelIdCounter: number;
}

export interface AugmentedProjectRecord extends ProjectRecord {
  role: number;
  ownerName: string;
}
