import { Workflow, WorkflowAction } from 'klendathu-json-types';
import { ObservableChanges, ObservableIssue, session, Template } from '../../../models';
import { AccountName } from '../../common/AccountName';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { computed } from 'mobx';

// import './WorkflowActions.scss';

interface Props {
  issue: ObservableIssue;
  changes: ObservableChanges;
  template: Template;
  onExecAction: (a: ExecutableAction) => void;
}

interface ExecutableAction extends WorkflowAction {
  stateName?: string;
}

interface State {
  actions: ExecutableAction[];
}

export class WorkflowActions extends React.Component<Props, State> {
  public render() {
    return (
      <section className="wf-actions">
        {this.actionTable.map((a, index) => (<div className="wf-action" key={index}>
          <Button bsStyle="default" onClick={() => this.props.onExecAction(a)}>{a.caption}</Button>
          {a.state && (
            <div className="effect">state &rarr; <span className="value">{a.stateName}</span></div>
          )}
          {a.owner && (
            <div className="effect">owner &rarr; <span className="value">
              <AccountName id={a.owner} />
            </span></div>
          )}
          {a.owner === null && (
            <div className="effect">owner &rarr; <span className="none">none</span></div>
          )}
        </div>))}
      </section>
    );
  }

  /** Searches the issue for the owner prior to the current owner. */
  private findPreviousOwner(): string {
    const { issue, changes } = this.props;
    const owner = issue.owner;
    if (!changes) {
      return undefined;
    }
    for (let i = changes.length - 1; i >= 0; i -= 1) {
      const change = changes.changes[i];
      if (change.owner && change.owner.after !== owner) {
        return change.owner.after;
      }
    }
    return undefined;
  }

  @computed
  private get actionTable(): ExecutableAction[] {
    const { template, issue } = this.props;
    const workflow = this.workflow;
    if (!workflow) {
      return [];
    }
    const actions: ExecutableAction[] = [];
    for (const action of template.actions) {
      if (this.isLegalTransition(action)) {
        const resolvedAction: ExecutableAction = {
          caption: action.caption,
        };
        if (action.state) {
          const toState = template.states.find(a => a.id === action.state);
          resolvedAction.state = action.state;
          resolvedAction.stateName = toState.caption;
        }
        // Handle owner expressions.
        if (typeof action.owner === 'string') {
          const m = action.owner.match(/\{(\w+?)\}/);
          if (m) {
            const oName = m[1];
            if (oName === 'me') {
              resolvedAction.owner = session.account.uid;
            } else if (oName === 'reporter') {
              resolvedAction.owner = this.props.issue.reporter;
            } else if (oName === 'previous') {
              resolvedAction.owner = this.findPreviousOwner();
            } else if (oName === 'none') {
              resolvedAction.owner = null;
            }
          }
          // If the owner wouldn't change, then don't show that effect.
          if (resolvedAction.owner === issue.owner) {
            resolvedAction.owner = undefined;
          }
        }
        // Only include actions that have an effect.
        if (resolvedAction.state !== undefined || resolvedAction !== undefined) {
          actions.push(resolvedAction);
        }
      }
    }
    return actions;
  }

  @computed
  private get workflow(): Workflow {
    const { template, issue } = this.props;
    return template.getWorkflowForType(issue.type);
  }

  @computed
  private get workflowStates(): string[] {
    return this.workflow ? this.workflow.states : [];
  }

  /** Determine if the state transition for the action is a legal one. */
  private isLegalTransition(action: WorkflowAction) {
    const { template, issue } = this.props;
    const currentState = template.states.find(st => st.id === issue.state);
    // Make sure the state we're transitioning to is acceptable.
    if (action.state) {
      // New state must be listed in the set of template states (spelling check).
      if (template.states.findIndex(st => st.id === action.state) < 0) {
        return false;
      }

      // New state must be included in states for current workflow
      if (this.workflowStates.indexOf(action.state) < 0) {
        return false;
      }

      // New state must be mentioned in outgoing transitions of current state.
      if (currentState.transitions.indexOf(action.state) < 0) {
        return false;
      }
    }

    // Check if this action has a current state requirement.
    // console.log(JSON.stringify(action, null, 2));
    if (action.require && action.require.state) {
      if (action.require.state.indexOf(issue.state) < 0) {
        return false;
      }
    }

    return true;
  }
}
