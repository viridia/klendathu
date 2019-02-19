import * as React from 'react';
import { computed } from 'mobx';
import { WorkflowAction, Workflow } from '../../../../common/types/json';
import { Button, AccountName } from '../../controls';
import { Issue, TimelineEntry } from '../../../../common/types/graphql';
import { ViewContext, session } from '../../models';
import styled from 'styled-components';

const WorkflowActionsLayout = styled.section`
  display: flex;
  align-items: stretch;
  flex-direction: column;
`;

const WorkflowActionEl = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 16px;

  > button {
    display: inline-block;
    justify-content: center;
    margin-bottom: 2px;
    white-space: normal;
  }
`;

const WorkflowEffect = styled.section`
  font-size: 90%;
  margin-left: 32px;
  text-indent: -16px;
  color: $textDark;

  > .value {
    white-space: nowrap;
  }

  > .none {
    font-style: italic;
    color: lighten($textDark, 10%);
  }
`;

interface Props {
  issue: Issue;
  env: ViewContext;
  timeline: TimelineEntry[];
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
      <WorkflowActionsLayout>
        {this.actionTable.map((a, index) => (
          <WorkflowActionEl key={index}>
            <Button kind="default" onClick={() => this.props.onExecAction(a)}>{a.caption}</Button>
            {a.state && (
              <WorkflowEffect className="effect">
                state &rarr; <span className="value">{a.stateName}</span>
              </WorkflowEffect>
            )}
            {a.owner && (
              <WorkflowEffect className="effect">
                owner &rarr; <span className="value"><AccountName id={a.owner} /></span>
              </WorkflowEffect>
            )}
            {a.owner === null && (
              <WorkflowEffect className="effect">
                owner &rarr; <span className="none">none</span>
              </WorkflowEffect>
            )}
          </WorkflowActionEl>
        ))}
      </WorkflowActionsLayout>
    );
  }

  /** Searches the issue for the owner prior to the current owner. */
  private findPreviousOwner(): string {
    const { issue, timeline } = this.props;
    const owner = issue.owner;
    if (!timeline) {
      return undefined;
    }
    for (let i = timeline.length - 1; i >= 0; i -= 1) {
      const change = timeline[i];
      if (change.owner && change.owner.after !== owner) {
        return change.owner.after;
      }
    }
    return undefined;
  }

  @computed
  private get actionTable(): ExecutableAction[] {
    const { env, issue } = this.props;
    const workflow = this.workflow;
    if (!workflow) {
      return [];
    }
    const actions: ExecutableAction[] = [];
    for (const action of env.template.actions) {
      if (this.isLegalTransition(action)) {
        const resolvedAction: ExecutableAction = {
          caption: action.caption,
        };
        if (action.state) {
          const toState = env.template.states.find(a => a.id === action.state);
          resolvedAction.state = action.state;
          resolvedAction.stateName = toState.caption;
        }
        // Handle owner expressions.
        if (typeof action.owner === 'string') {
          const m = action.owner.match(/\{(\w+?)\}/);
          if (m) {
            const oName = m[1];
            if (oName === 'me') {
              resolvedAction.owner = session.account.id;
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
    const { env, issue } = this.props;
    return env.getWorkflowForType(issue.type);
  }

  @computed
  private get workflowStates(): string[] {
    return this.workflow ? this.workflow.states : [];
  }

  /** Determine if the state transition for the action is a legal one. */
  private isLegalTransition(action: WorkflowAction) {
    const { env, issue } = this.props;
    const currentState = env.template.states.find(st => st.id === issue.state);
    // Make sure the state we're transitioning to is acceptable.
    if (action.state) {
      // New state must be listed in the set of template states (spelling check).
      if (env.template.states.findIndex(st => st.id === action.state) < 0) {
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
