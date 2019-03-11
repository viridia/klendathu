import * as React from 'react';
import * as H from 'history';
import * as qs from 'qs';
import { computed, action, observable, ObservableMap } from 'mobx';
import { Workflow } from '../../../../common/types/json';
import { Issue, TimelineEntry, UpdateIssueInput } from '../../../../common/types/graphql';
import { ViewContext, OperandType, defaultOperandValue } from '../../models';
import { updateIssue } from '../../graphql';
import { observer } from 'mobx-react';
import { ExecutableAction, ExecutableLinkEffect } from './ExecutableAction';
import { WorkflowActionControl } from './WorkflowActionControl';
import { ActionEnv } from './ActionEnv';
import { WorkflowInputsDialog } from './WorkflowInputsDialog';
import styled from 'styled-components';
import { idToIndex } from '../../lib/idToIndex';

const WorkflowActionsLayout = styled.section`
  display: flex;
  align-items: stretch;
  flex-direction: column;
`;

interface Props {
  env: ViewContext;
  issue: Issue;
  timeline: TimelineEntry[];
  history: H.History;
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
              vars={this.placeholderEnv}
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

  /** Returns an environment that contains placeholder values which is used to display
      what would happen if the workflow action was invoked.
   */
  @computed
  private get placeholderEnv(): ActionEnv {
    const { issue, timeline } = this.props;
    const actionProps = new ObservableMap<string, any>();
    return new ActionEnv(issue, timeline, actionProps);
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
    const { env } = this.props;
    if (execAction.inputs.size > 0) {
      this.actionProps.clear();
      for (const input of execAction.inputs.values()) {
        const defaultValue = defaultOperandValue(env.template, input.type, null);
        if (defaultValue !== undefined) {
          this.actionProps.set(input.id, defaultValue);
        }
      }
      this.pendingAction = execAction;
      this.showInput = true;
      return;
    }
    this.apply(execAction);
  }

  @action.bound
  private apply(act: ExecutableAction) {
    const { issue, env, timeline, history } = this.props;
    const finalEnv = new ActionEnv(issue, timeline, this.actionProps);
    const effects = act.effects(issue, finalEnv);

    if (act.target === 'copy' || act.target === 'new') {
      const query: any = {};
      effects.forEach(eff => {
        if (eff.type === OperandType.LINK) {
          const value = eff.value as ExecutableLinkEffect[];
          for (const v of value) {
            query[`${eff.key}_${v.to.toString()}`] = v.relation;
          }
        } else {
          query[eff.key] = eff.value;
        }
      });

      // Create empty issue input
      if (act.target === 'copy') {
        history.push({
          pathname: `/${env.account.accountName}/${env.project.name}/clone/${idToIndex(issue.id)}`,
          search: qs.stringify(query, { addQueryPrefix: true }),
        });
      } else {
        history.push({
          pathname: `/${env.account.accountName}/${env.project.name}/new`,
          search: qs.stringify(query, { addQueryPrefix: true }),
        });
      }
      return;
    }

    if (effects.length === 0) {
      return;
    }

    const update: UpdateIssueInput = {};
    effects.forEach(eff => {
      update[eff.key] = eff.value as string;
    });

    return updateIssue({ id: issue.id, input: update }).catch(error => {
      env.mutationError = error;
    });
  }

  @computed
  private get workflow(): Workflow {
    const { env, issue } = this.props;
    return env.getWorkflowForType(issue.type);
  }
}
