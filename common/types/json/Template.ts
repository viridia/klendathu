import { Relation } from '../graphql';

/** Field data type. */
export enum DataType {
  TEXT = 'text',
  ENUM = 'enum',
}

/** Defines a custom field type. */
export interface FieldType {
  /** Unique id of this field. */
  id: string;

  /** Label for this field. */
  caption: string;

  /** Data type for this field. */
  type: DataType;

  /** Default value for this field. */
  default?: string;

  /** Whether this field should be center-aligned in the issue list column. */
  align?: string;

  /** List of valid values for this type. */
  values?: string[];

  /** For string fields, the maximum length of the field. */
  maxLength?: number;
}

/** Defines an issue type (bug, feature request, etc.). */
export interface IssueType {
  /** Unique id of this issue type. */
  id: string;

  /** Text name of this issue type. */
  caption: string;

  /** If false, means you cannot create issues of this type. */
  abstract?: boolean;

  /** Issue type that this inherits from. */
  extends: string;

  /** Which workflow type to use with this issue type. */
  workflow?: string;

  /** Background color for this type. */
  bg?: string;

  /** List of custom field definitions for this issue type. */
  fields?: FieldType[];
}

/** Description of a workflow state. */
export interface WorkflowState {
  /** Unique id of this workflow state. */
  id: string;

  /** Human-readable name of this workflow state. */
  caption: string;

  /** Whether this state is closed or open. */
  closed?: boolean;

  /** List of states which can follow this state. */
  transitions: string[];
}

/** Iteractive input properties for a workflow action - prompts user for input. */
export interface WorkflowInput {
  /** Id of the input property */
  id: string;

  /** Caption of the input field */
  caption: string;

  /** Type of data being queried */
  type: 'issue';
}

/** Describes mutations made as a result of executing a workflow action. */
export interface WorkflowLinkEffect {
  to: string;
  relation: Relation;
}

/** Describes mutations made as a result of executing a workflow action. */
export interface WorkflowAction {
  /** Title of this action. */
  caption: string;

  /** Indicates that this action should create a new issue. */
  target?: 'self' | 'new' | 'copy';

  /** State to transition to. */
  state?: string;

  /** Replacement summary. */
  summary?: string;

  /** Replacement description. */
  description?: string;

  /** Owner to assign to. */
  owner?: string;

  /** Action to create a link. */
  linked?: WorkflowLinkEffect;

  /** Action to add links. */
  addLinks?: WorkflowLinkEffect[];

  /** Input to get from the user. */
  ask?: WorkflowInput[];

  /** Prerequisites for this action. */
  require?: {
    /** List of allowable states for this action. */
    state?: string[];
  };
}

/** Issue workflow definition, determines how issues may change state. */
export interface Workflow {
  /** Name of this workflow. */
  name: string;

  /** Project where this workflow is defined. */
  project: string;

  /** Workflows that this is an extension of. */
  extends: string[];

  /** Starting states of this workflow (from which the user can choose). */
  start?: string[];

  /** List of valid states for this workflow. */
  states: string[];
}

/** Defines the set of issue types. */
export interface Template {
  /** Name of this template. */
  name: string;

  /** Project where this template is defined. */
  // project: string;

  /** List of issue types for this template. */
  types: IssueType[];

  /** List of workflow states. */
  states: WorkflowState[];

  /** List of workflow states. */
  actions: WorkflowAction[];

  /** List of workflows. */
  workflows: Workflow[];
}
