import * as React from 'react';
import { Button, Dialog, FormControlGroup, Form, AutoNavigate, FormLabel } from 'skyhook-ui';
import { observer } from 'mobx-react';
import { ExecutableInput } from './ExecutableAction';
import bind from 'bind-decorator';
import { OperandType, ViewContext } from '../../models';
import { IssueSelector } from '../input';
import { styled } from '../../style';
import { computed } from 'mobx';
import { Issue } from '../../../../common/types/graphql';
import { EditOperand } from '../input/EditOperand';

const InputControlGroup = styled(FormControlGroup)`
  justify-self: stretch;
  width: 25rem;
`;

interface Props {
  env: ViewContext;
  title: string;
  issue: Issue;
  inputs: Map<string, ExecutableInput>;
  outputs: Map<string, any>;
  open: boolean;
  onClose: () => void;
  onApplyChanges: () => void;
}

@observer
export class WorkflowInputsDialog extends React.Component<Props> {
  public render() {
    const { open, onClose, title, inputs } = this.props;
    const disabled = !this.canApply;
    return (
      <Dialog open={open} onClose={onClose}>
        <Dialog.Header>{title}</Dialog.Header>
        <Dialog.Body>
          <Form layout="ledger" onSubmit={this.onApply}>
            <AutoNavigate />
            {Array.from(inputs.values()).map((inputField, index) => (
              <React.Fragment key={inputField.id}>
                <FormLabel>{inputField.caption}:</FormLabel>
                <InputControlGroup>
                  {this.renderInputField(inputField, index === 0)}
                </InputControlGroup>
              </React.Fragment>
            ))}
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={this.onApply} disabled={disabled}>Apply</Button>
        </Dialog.Footer>
      </Dialog>
    );
  }

  private renderInputField(input: ExecutableInput, first: boolean): JSX.Element {
    const { env, outputs, issue } = this.props;
    if (input.type === OperandType.ISSUE) {
      return (
        <IssueSelector
            env={env}
            selection={outputs.get(input.id)}
            autoFocus={first}
            exclude={new Set([issue.id])}
            onSelectionChange={selection => outputs.set(input.id, selection)}
        />
      );
    } else {
      return (
        <EditOperand
            type={input.type}
            value={outputs.get(input.id)}
            customField={null}
            onChange={value => outputs.set(input.id, value)}
        />
      );
    }
  }

  @computed
  private get canApply(): boolean {
    const { inputs, outputs } = this.props;
    for (const input of inputs.values()) {
      const output = outputs.get(input.id);
      if (input.type === OperandType.RELATION) {
        if (output === null || output === undefined) {
          return false;
        }
      } else if (input.type === OperandType.ISSUE) {
        if (output === null || output === undefined) {
          return false;
        }
      }
    }
    return true;
  }

  @bind
  private onApply(e: any) {
    e.preventDefault();
    if (this.canApply) {
      this.props.onApplyChanges();
    }
  }
}
