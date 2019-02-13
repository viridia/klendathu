import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Label, Project } from '../../../common/types/graphql';
import {
  Button,
  Dialog,
  Form,
  TextInput,
  CheckBox,
  FormLabel,
  Chip,
} from '../controls';
import { client, decodeErrorAsException } from '../graphql/client';
import classNames from 'classnames';
import LABEL_COLORS from './LabelColors';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { fragments } from '../graphql';

const NewLabelMutation = gql`
  mutation NewLabelMutation($project: ID!, $input: LabelInput!) {
    newLabel(project: $project, input: $input) { ...LabelFields }
  }
  ${fragments.label}
`;

const UpdateLabelMutation = gql`
  mutation UpdateLabelMutation($id: ID!, $input: LabelInput!) {
    updateLabel(id: $id, input: $input) { ...LabelFields }
  }
  ${fragments.label}
`;

const AddPrefsLabelMutation = gql`
  mutation AddPrefsLabelMutation($project: ID!, $label: ID!) {
    addPrefsLabel(project: $project, label: $label) { labels }
  }
`;

const RemovePrefsLabelMutation = gql`
  mutation RemovePrefsLabelMutation($project: ID!, $label: ID!) {
    removePrefsLabel(project: $project, label: $label) { labels }
  }
`;

const ColorTable = styled.div`
  display: flex;
  flex: 1;
  margin-bottom: 1rem;

  .color-column {
    display: flex;
    flex-direction: column;
    flex: 1;

    > .color-selector {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 4px;
      margin: 2px;

      &.selected {
        border: 3px solid black;
      }
    }
  }
`;

const LabelPreviewGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 1.8rem;
  margin-top: 1rem;

  && > * {
    margin: 0 .5rem 0 0;
  }
`;

interface Props {
  open: boolean;
  project: Project;
  label?: Label;
  onClose: () => void;
  onInsertLabel: (label: string) => void;
  visible?: boolean;
}

@observer
export class LabelDialog extends React.Component<Props> {
  @observable private labelName: string = '';
  @observable private color: string = '#e679f8';
  @observable private visible: boolean = true;
  @observable private busy: boolean = false;

  public componentWillMount() {
    const { label } = this.props;
    if (label) {
      this.labelName = label.name;
      this.color = label.color;
      this.visible = this.props.visible;
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.open && !this.props.open) {
      this.labelName = '';
      this.color = LABEL_COLORS[0][0];
      this.visible = true;
    }
    if (nextProps.label && !this.props.label) {
      const { label } = nextProps;
      this.labelName = label.name;
      this.color = label.color;
      this.visible = this.props.visible;
    }
  }

  public render() {
    const { label, open, onClose } = this.props;
    return (
      <Dialog
          open={open}
          onClose={onClose}
      >
        <Dialog.Header hasClose={true}>
          {label ? <span>Edit Label</span> : <span>Create Label</span>}
        </Dialog.Header>
        <Dialog.Body>
          <Form layout="stacked" onSubmit={this.onSubmit}>
            <FormLabel>Label text</FormLabel>
            <TextInput
                value={this.labelName}
                placeholder="Text for this label"
                autoFocus={true}
                maxLength={64}
                onChange={this.onChangeLabelText}
            />
            <FormLabel>Label color</FormLabel>
            <ColorTable>
              {LABEL_COLORS.map((row, index) => (
                <div className="color-column" key={index}>
                  {row.map(color =>
                    <button
                        className={classNames('color-selector',
                          { selected: color === this.color })}
                        key={color}
                        data-color={color}
                        style={{ backgroundColor: color }}
                        onClick={this.onChangeLabelColor}
                    >
                      A
                    </button>)}
                </div>))}
            </ColorTable>
            <CheckBox checked={this.visible} onChange={this.onChangeVisible}>
              Show label in hotlist
            </CheckBox>
            <LabelPreviewGroup>
              <FormLabel>Label preview:</FormLabel>
              {this.labelName && <Chip color={this.color}>{this.labelName}</Chip>}
            </LabelPreviewGroup>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.labelName.length < 3 || this.busy}
              kind="primary"
          >
            {label ? 'Save' : 'Create'}
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @action.bound
  private onChangeLabelText(e: any) {
    this.labelName = e.target.value;
  }

  @action.bound
  private onChangeVisible(e: any) {
    this.visible = e.target.checked;
  }

  @action.bound
  private onChangeLabelColor(e: any) {
    e.preventDefault();
    this.color = e.target.dataset.color;
  }

  @action.bound
  private onSubmit() {
    const { label, project: project } = this.props;
    if (this.labelName.length < 3) {
      return;
    }
    const labelInput = { color: this.color, name: this.labelName };
    this.busy = true;
    let result: Promise<Label>;
    if (label) {
      result = client.mutate<{ updateLabel: Label }>({
        mutation: UpdateLabelMutation,
        variables: { id: label.id, input: labelInput }
      }).then(({ data, errors }) => {
        if (errors) {
          decodeErrorAsException(errors);
        }
        return data.updateLabel;
      });
    } else {
      result = client.mutate<{ newLabel: Label }>({
        mutation: NewLabelMutation,
        variables: { project: project.id, input: labelInput }
      }).then(({ data, errors }) => {
        if (errors) {
          decodeErrorAsException(errors);
        }
        return data.newLabel;
      });
    }

    result.then(updatedLabel => {
      let promise: Promise<any> = null;
      if (this.visible && (!label || !this.props.visible)) {
        promise = client.mutate({
          mutation: AddPrefsLabelMutation,
          variables: { project: project.id, label: updatedLabel.id }
        });
      } else if (!this.visible && label && this.props.visible) {
        promise = client.mutate({
          mutation: RemovePrefsLabelMutation,
          variables: { project: project.id, label: updatedLabel.id }
        });
      } else {
        promise = Promise.resolve(({ data: null, errors: null }));
      }

      promise.then(({ data, errors }) => {
        this.busy = false;
        this.props.onClose();
        if (errors) {
          decodeErrorAsException(errors);
        }
        this.props.onInsertLabel(updatedLabel.id);
      });
    }, error => {
      this.busy = false;
      this.props.onClose();
      console.error(error);
    });
  }
}
