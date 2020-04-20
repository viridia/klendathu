import React from 'react';
import { defaultOperandValue, OperandType, ViewContext } from '../models';
import { observer } from 'mobx-react';
import { FieldType } from '../../../common/types/json';
import { EditOperand } from '../issues/input/EditOperand';
import { UpdateIssueInput, PublicAccount } from '../../../common/types/graphql';
import bind from 'bind-decorator';
import styled from 'styled-components';
import { DismissButton } from 'skyhook-ui';
import { Select, Option } from '../controls/widgets';
import { ObservableSet } from 'mobx';

const MassActionLayout = styled.section`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin: 4px;

  > * {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }

  .action-type {
    min-width: 12rem;
  }

  .action-operand {
    display: flex;
    flex: 1;
    justify-content: flex-start;
  }
`;

interface ActionType {
  id: string;
  caption: string;
  type: OperandType;
  apply: (update: UpdateIssueInput, value: any) => void;
  customField?: FieldType;
}

export interface EditAction extends ActionType {
  value: any;
}

interface Props {
  index?: number;
  action?: EditAction;
  env: ViewContext;
  onChange: (index: number, action: EditAction & ActionType) => void;
  onRemove: (index: number) => void;
}

@observer
export class MassAction extends React.Component<Props> {
  private static ACTION_TYPES: ActionType[] = [
    {
      id: 'addLabel',
      caption: 'Add Label',
      type: OperandType.LABEL,
      apply: (update: UpdateIssueInput, value: string[]) => {
        update.addLabels = [].concat(update.addLabels || [], value.slice());
      },
    },
    {
      id: 'removeLabel',
      caption: 'Remove Label',
      type: OperandType.LABEL,
      apply: (update: UpdateIssueInput, value: string[]) => {
        update.removeLabels = [].concat(update.removeLabels || [], value.slice());
      },
    },
    {
      id: 'state',
      caption: 'Change State',
      type: OperandType.STATE,
      apply: (update: UpdateIssueInput, value: string) => {
        update.state = value;
      },
    },
    {
      id: 'type',
      caption: 'Change Type',
      type: OperandType.TYPE,
      apply: (update: UpdateIssueInput, value: string) => {
        update.type = value;
      },
    },
    {
      id: 'owner',
      caption: 'Change Owner',
      type: OperandType.USER,
      apply: (update: UpdateIssueInput, value: PublicAccount) => {
        const user = value ? value.id : null;
        update.owner = user;
      },
    },
    {
      id: 'addWatchers',
      caption: 'Add Watchers',
      type: OperandType.USERS,
      apply: (update: UpdateIssueInput, value: PublicAccount[]) => {
        update.addWatchers = value.map(l => l.id);
        return true;
      },
    },
    {
      id: 'removeWatchers',
      caption: 'Remove Watchers',
      type: OperandType.USERS,
      apply: (update: UpdateIssueInput, value: PublicAccount[]) => {
        update.removeWatchers = value.map(l => l.id);
      },
    },
    {
      id: 'milestone',
      caption: 'Set Milestone',
      type: OperandType.MILESTONE,
      apply: (update: UpdateIssueInput, value: string) => {
        update.milestone = value;
      },
    },
    {
      id: 'addSprint',
      caption: 'Add Sprint',
      type: OperandType.SPRINT,
      apply: (update: UpdateIssueInput, value: ObservableSet<string>) => {
        update.addSprints = Array.from(value);
        return true;
      },
    },
    {
      id: 'removeSprint',
      caption: 'Remove Sprint',
      type: OperandType.SPRINT,
      apply: (update: UpdateIssueInput, value: ObservableSet<string>) => {
        update.removeSprints = Array.from(value);
      },
    },
    {
      id: 'delete',
      caption: 'Delete',
      type: null,
      // action: 'delete',
      apply: () => { /* */ },
    },
  ];

  public render() {
    const { index, action, env } = this.props;
    const options: Option<string>[] = [];
    MassAction.ACTION_TYPES.forEach(at => {
      // Don't show milestone edit if there are no milestones defined.
      if (at.type === OperandType.MILESTONE && env.milestones.length < 1) {
        return;
      }
      options.push({
        value: at.id,
        label: at.caption,
      });
    });

    return (
      <MassActionLayout>
        <Select
          value={action && action.id}
          options={options}
          onChange={this.onSelectActionType}
          placeholder={<span>Choose action&hellip;</span>}
          width="12rem"
        />
        <section className="action-operand">
          {action && (
            <EditOperand
              type={action.type}
              value={action.value}
              customField={action.customField}
              onChange={this.onChangeValue}
            />
          )}
        </section>
        {index !== undefined && <DismissButton onClick={this.onRemove}/>}
      </MassActionLayout>
    );
  }

  @bind
  private onSelectActionType(id: any) {
    const { index, action, onChange, env } = this.props;
    const newAction = MassAction.ACTION_TYPES.find(actionType => actionType.id === id);
    if (!action || newAction.id !== action.id) {
      onChange(index, {
        ...newAction,
        value: defaultOperandValue(env.template, newAction.type, newAction.customField),
      });
    }
  }

  @bind
  private onChangeValue(value: any) {
    const { action } = this.props;
    action.value = value;
  }

  @bind
  private onRemove(e: any) {
    e.preventDefault();
    const { index, onRemove } = this.props;
    onRemove(index);
  }
}
