import * as React from 'react';
import { computed, action, observable, ObservableMap, toJS } from 'mobx';
import { Workflow } from '../../../../common/types/json';
import { Issue, TimelineEntry, Mutation, UpdateIssueInput } from '../../../../common/types/graphql';
import { ViewContext } from '../../models';
import { fragments } from '../../graphql';
import { client } from '../../graphql/client';
import { observer } from 'mobx-react';
import { ExecutableAction } from './ExecutableAction';
import { WorkflowActionControl } from './WorkflowActionControl';
import { ActionEnv } from './ActionEnv';
import { WorkflowInputsDialog } from './WorkflowInputsDialog';
import styled from 'styled-components';
import gql from 'graphql-tag';

const UpdateIssueMutation = gql`
  mutation UpdateIssueMutation($id: ID!, $input: UpdateIssueInput!) {
    updateIssue(id: $id, input: $input) {
      ...IssueFields
      ownerAccount { ...AccountFields }
      ccAccounts { ...AccountFields }
    }
  }
  ${fragments.account}
  ${fragments.issue}
`;

type UpdateIssueMutationResult = Pick<Mutation, 'updateIssue'>;

const WorkflowActionsLayout = styled.section`
  display: flex;
  align-items: stretch;
  flex-direction: column;
`;

interface Props {
  env: ViewContext;
  issue: Issue;
  timeline: TimelineEntry[];
}

@observer
export class WorkflowActions extends React.Component<Props> {
  @observable private pendingAction: ExecutableAction = null;
  @observable private actionProps = new ObservableMap<string, any>();
  @observable private showInput = false;

  public render() {
    const { issue, env } = this.props;
    return (
      <WorkflowActionsLayout>
        {this.pendingAction && (
          <WorkflowInputsDialog
            env={env}
            title={this.pendingAction.caption}
            inputs={this.pendingAction.inputs}
            issue={issue}
            outputs={this.actionProps}
            open={this.showInput}
            onClose={this.onCloseInput}
            onApplyChanges={this.onClickApply}
          />
        )}
        {this.actions.map((a, index) => (
          <WorkflowActionControl
              key={index}
              execAction={a}
              issue={issue}
              vars={this.actionEnv}
              onExec={this.exec}
          />
        ))}
      </WorkflowActionsLayout>
    );
  }

  @computed
  private get actions(): ExecutableAction[] {
    const { env } = this.props;
    const workflow = this.workflow;
    if (!workflow) {
      return [];
    }
    return env.template.actions.map(act => new ExecutableAction(env, act));
  }

  @computed
  private get actionEnv(): ActionEnv {
    const { issue, timeline } = this.props;
    return new ActionEnv(issue, timeline, this.actionProps);
  }

  @action.bound
  private onCloseInput() {
    this.showInput = false;
  }

  @action.bound
  private onClickApply() {
    this.showInput = false;
    this.apply(this.pendingAction);
  }

  @action.bound
  private exec(execAction: ExecutableAction) {
    if (execAction.inputs.size > 0) {
      this.actionProps.clear();
      this.pendingAction = execAction;
      this.showInput = true;
      return;
    }
    this.apply(execAction);
  }

  @action.bound
  private apply(act: ExecutableAction) {
    const { issue, env } = this.props;
    if (act.target === 'copy' || act.target === 'new') {
      // Create empty issue input
      if (act.target === 'copy') {
        // Copy from old issue
        console.log('copy');
      }
      // Create issue
      // Navigate to edit view
      console.log('TODO: workflow target');
      return;
    }

    const effects = act.effects(issue, this.actionEnv);
    if (effects.length === 0) {
      return;
    }

    const update: UpdateIssueInput = {};
    effects.forEach(eff => {
      update[eff.key] = eff.value as string;
    });

    return client.mutate<UpdateIssueMutationResult>({
      mutation: UpdateIssueMutation,
      variables: {
        id: issue.id,
        input: update,
      }
    }).catch(error => {
      env.mutationError = error;
    });
  }

  @computed
  private get workflow(): Workflow {
    const { env, issue } = this.props;
    return env.getWorkflowForType(issue.type);
  }
}
