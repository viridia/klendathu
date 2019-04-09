import { WorkflowAction } from '../../../../common/types/json';
import { UpdateIssueInput, Issue, Relation } from '../../../../common/types/graphql';
import { ViewContext, OperandType } from '../../models';
import { ActionEnv } from './ActionEnv';

export interface ExecutableInput {
  id: string;
  caption: string;
  type: OperandType;
}

export const PLACEHOLDER = Symbol('placeholder');

export interface ExecutableLinkEffect {
  to: string | symbol;
  relation: Relation | symbol;
}

export interface ExecutableEffect {
  key: keyof UpdateIssueInput;
  value: string | ExecutableLinkEffect[] | symbol;
  type: OperandType;
}

/** Computes what effects a workflow action would have on the current issue. */
export class ExecutableAction {
  public inputs = new Map<string, ExecutableInput>();

  constructor(private env: ViewContext, private action: WorkflowAction) {
    this.scanForInputFields(this.action.state, OperandType.STATE);
    this.scanForInputFields(this.action.summary, OperandType.TEXT);
    this.scanForInputFields(this.action.description, OperandType.TEXT);
    this.scanForInputFields(this.action.owner, OperandType.USER);
    if (this.action.addLinks) {
      this.action.addLinks.forEach(link => {
        this.scanForInputFields(link.relation, OperandType.RELATION);
        this.scanForInputFields(link.to, OperandType.ISSUE);
      });
    }
  }

  public get caption(): string {
    return this.action.caption;
  }

  public get target(): string {
    return this.action.target;
  }

  public effects(issue: Issue, ae: ActionEnv): ExecutableEffect[] {
    const newIssue = this.action.target === 'copy' || this.action.target === 'new';
    const result: ExecutableEffect[] = [];

    // Can't update if it would put issue in an illegal state.
    if (!this.isLegalTransition(issue) && !newIssue) {
      return [];
    }

    if (this.action.state !== undefined) {
      const state = this.lookup(this.action.state, ae);
      if (newIssue || state !== issue.state) {
        result.push({
          key: 'state',
          type: OperandType.STATE,
          value: state,
        });
      }
    }

    if (this.action.summary !== undefined) {
      const summary = this.subst(this.action.summary, ae);
      if (newIssue || summary !== issue.summary) {
        result.push({
          key: 'summary',
          type: OperandType.TEXT,
          value: summary,
        });
      }
    }

    if (this.action.description !== undefined) {
      const description = this.subst(this.action.description, ae);
      if (newIssue || description !== issue.description) {
        result.push({
          key: 'description',
          type: OperandType.TEXT,
          value: description,
        });
      }
    }

    if (this.action.owner !== undefined) {
      const owner = this.lookup(this.action.owner, ae);
      if (newIssue || owner !== issue.owner) {
        result.push({
          key: 'owner',
          type: OperandType.USER,
          value: owner,
        });
      }
    }

    if (this.action.addLinks) {
      result.push({
        key: 'addLinks',
        type: OperandType.LINK,
        value: this.action.addLinks.map(link => ({
          relation: this.lookup(link.relation, ae) as Relation,
          to: this.lookup(link.to, ae),
        })),
      });
    }

    return result;
  }

  private subst(value: string, ae: ActionEnv): string {
    return value.replace(/\{(\w+)(?:\:\w+\?)?\}/g, (_, propName) => {
      const repl = ae.get(propName);
      if (repl !== undefined) {
        return String(repl);
      }
      return '?';
    });
  }

  private lookup(value: string, ae: ActionEnv): string | symbol {
    const m = value.match(/\{(\w+)(?:\:\w+\?)?\}/);
    if (m) {
      const repl = ae.get(m[1]);
      if (repl !== undefined) {
        return repl;
      }
      return PLACEHOLDER;
    } else {
      return value;
    }
  }

  private scanForInputFields(value: string, type: OperandType) {
    if (value) {
      const re = /\{(\w+?):(\w+?)\?\}/g;
      for (;;) {
        const m = re.exec(value);
        if (!m) {
          break;
        }
        const [, id, caption] = m;
        if (!this.inputs.has(id)) {
          this.inputs.set(id, { id, caption, type });
        }
      }
    }
  }

  /** Determine if the state transition for the action is a legal one. */
  private isLegalTransition(issue: Issue) {
    const workflow = this.env.getWorkflowForType(issue.type);
    const workflowStates = workflow ? workflow.states : [];
    const currentState = this.env.template.states.find(st => st.id === issue.state);
    // Make sure the state we're transitioning to is acceptable.
    if (this.action.state) {
      // New state must be listed in the set of template states (spelling check).
      if (this.env.template.states.findIndex(st => st.id === this.action.state) < 0) {
        return false;
      }

      // New state must be included in states for current workflow
      if (workflowStates.indexOf(this.action.state) < 0) {
        return false;
      }

      // New state must be mentioned in outgoing transitions of current state.
      if (currentState.transitions.indexOf(this.action.state) < 0) {
        return false;
      }
    }

    // Check if this action has a current state requirement.
    // console.log(JSON.stringify(action, null, 2));
    if (this.action.require && this.action.require.state) {
      if (this.action.require.state.indexOf(issue.state) < 0) {
        return false;
      }
    }

    return true;
  }
}
