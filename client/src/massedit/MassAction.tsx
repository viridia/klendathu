import * as React from 'react';
import { defaultOperandValue, OperandType, ViewContext } from '../models';
import { observer } from 'mobx-react';

import { FieldType } from '../../../common/types/json';
import { DropdownButton, MenuItem, DismissButton } from '../controls';
import { EditOperand } from '../issues/input/EditOperand';
import { UpdateIssueInput, PublicAccount } from '../../../common/types/graphql';
import bind from 'bind-decorator';
import styled from 'styled-components';

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
    flex: 1;
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
      id: 'addCC',
      caption: 'Add CC',
      type: OperandType.USERS,
      apply: (update: UpdateIssueInput, value: PublicAccount[]) => {
        update.addCC = value.map(l => l.id);
        return true;
      },
    },
    {
      id: 'removeCC',
      caption: 'Remove CC',
      type: OperandType.USERS,
      apply: (update: UpdateIssueInput, value: PublicAccount[]) => {
        update.removeCC = value.map(l => l.id);
      },
    },
    {
      id: 'delete',
      caption: 'Delete',
      type: null,
      // action: 'delete',
      apply: () => {/* */},
    },
  ];

  public render() {
    const { index, action, env } = this.props;
    const items: JSX.Element[] = [];
    MassAction.ACTION_TYPES.forEach(at => {
      items.push(<MenuItem eventKey={at.id} key={at.id}>{at.caption}</MenuItem>);
    });
    const caption = (action && action.caption) || 'Choose action...';

    return (
      <MassActionLayout>
        <DropdownButton
            className="action-type"
            size="small"
            kind="alternate"
            title={caption}
            onSelect={this.onSelectActionType}
        >
          {items}
        </DropdownButton>
        <section className="action-operand">
          {action && (
            <EditOperand
                type={action.type}
                kind="alternate"
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

  // renderOpValue() {
  //   return null;
  // }

  @bind
  private onSelectActionType(id: any) {
    const { index, action, onChange, env } = this.props;
    const newAction = MassAction.ACTION_TYPES.find(actionType => actionType.id === id);
    if (!action || newAction.type !== action.type) {
      onChange(index, {
        ...newAction,
        value: defaultOperandValue(env.template, newAction.type, newAction.customField),
      });
    // } else {
    //   onChange(index, { ...newAction, value: action.value });
    }
  }

  @bind
  private onChangeValue(value: any) {
    const { action } = this.props;
    action.value = value;
    // onChange(index, { ...action, value });
  }

  @bind
  private onRemove(e: any) {
    e.preventDefault();
    const { index, onRemove } = this.props;
    onRemove(index);
  }
}
