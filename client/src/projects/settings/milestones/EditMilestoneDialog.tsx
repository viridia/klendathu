import * as React from 'react';
import { observer } from 'mobx-react';
import {
  Dialog,
  Button,
  Form,
  FormLabel,
  TextInput,
  FormControlGroup,
  AutoNavigate,
  DatePicker,
} from '../../../controls';
import {
  Milestone,
  MilestoneStatus,
  Mutation,
  MilestoneInput,
} from '../../../../../common/types/graphql';
import { action, observable } from 'mobx';
import { ViewContext } from '../../../models';
import { MilestoneStatusSelector } from './MilestoneStatusSelector';
import { fragments } from '../../../graphql';
import gql from 'graphql-tag';
import { client } from '../../../graphql/client';

const NewMilestoneMutation = gql`
  mutation NewMilestoneMutation($project: ID!, $input: MilestoneInput!) {
    newMilestone(project: $project, input: $input) { ...MilestoneFields }
  }
  ${fragments.milestone}
`;

type NewMilestoneMutationResult = Pick<Mutation, 'newMilestone'>;

const UpdateMilestoneMutation = gql`
  mutation UpdateMilestoneMutation($id: ID!, $input: MilestoneInput!) {
    updateMilestone(id: $id, input: $input) { ...MilestoneFields }
  }
  ${fragments.milestone}
`;

type UpdateMilestoneMutationResult = Pick<Mutation, 'updateMilestone'>;

interface Props {
  env: ViewContext;
  open: boolean;
  onClose: () => void;
  milestone?: Milestone;
}

@observer
export class EditMilestoneDialog extends React.Component<Props> {
  @observable private name: string = '';
  @observable private description: string = '';
  @observable private status: MilestoneStatus = MilestoneStatus.Pending;
  @observable private start: Date = new Date();
  @observable private end: Date = new Date();
  @observable private busy = false;

  public render() {
    const { open, onClose, milestone } = this.props;
    return (
      <Dialog open={open} onClose={onClose} onShow={this.reset}>
        <Dialog.Header hasClose={true}>
          {milestone ? 'Edit Milestone' : 'Add Milestone'}
        </Dialog.Header>
        <Dialog.Body>
          <Form layout="ledger" onSubmit={this.onSave}>
            <AutoNavigate />
            <FormLabel>Name:</FormLabel>
            <TextInput value={this.name} onChange={this.onChangeName} />
            <FormLabel>Description:</FormLabel>
            <TextInput value={this.description} onChange={this.onChangeDescription} />
            <FormLabel>Status:</FormLabel>
            <MilestoneStatusSelector value={this.status} onChange={this.onChangeStatus} />
            {this.status !== MilestoneStatus.Timeless && (
              <React.Fragment>
                <FormLabel>Start:</FormLabel>
                <FormControlGroup>
                  <DatePicker
                    selected={this.start}
                    onChange={this.onChangeStart}
                  />
                </FormControlGroup>
                <FormLabel>End:</FormLabel>
                <FormControlGroup>
                  <DatePicker
                    selected={this.end}
                    onChange={this.onChangeEnd}
                  />
                </FormControlGroup>
              </React.Fragment>
            )}
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
              onClick={this.onSave}
              disabled={this.name === null || this.description === null || this.busy}
              kind="primary"
          >
            {milestone ? 'Save' : 'Add'}
          </Button>
        </Dialog.Footer>
      </Dialog>
    );
  }

  @action.bound
  private onChangeName(e: any) {
    this.name = e.target.value;
  }

  @action.bound
  private onChangeDescription(e: any) {
    this.description = e.target.value;
  }

  @action.bound
  private onChangeStatus(status: MilestoneStatus) {
    this.status = status;
  }

  @action.bound
  private onChangeStart(date: Date) {
    this.start = date;
  }

  @action.bound
  private onChangeEnd(date: Date) {
    this.end = date;
  }

  @action.bound
  private onSave() {
    const { onClose, env } = this.props;
    this.busy = true;
    const input: MilestoneInput = {
      name: this.name,
      description: this.description,
      status: this.status,
      startDate: this.status === MilestoneStatus.Timeless ? null : this.start,
      endDate: this.status === MilestoneStatus.Timeless ? null : this.end,
    };

    if (this.props.milestone) {
      client.mutate<UpdateMilestoneMutationResult>({
        mutation: UpdateMilestoneMutation,
        variables: {
          id: this.props.milestone.id,
          input,
        }
      }).then(({ data, errors }) => {
        this.busy = false;
        onClose();
        if (errors) {
          env.error = errors[0];
        }
        return data.updateMilestone;
      }, error => {
        env.mutationError = error;
        this.busy = false;
        onClose();
      });
    } else {
      client.mutate<NewMilestoneMutationResult>({
        mutation: NewMilestoneMutation,
        variables: {
          project: env.project.id,
          input,
        }
      }).then(({ data, errors }) => {
        this.busy = false;
        onClose();
        if (errors) {
          env.error = errors[0];
        }
        return data.newMilestone;
      }, error => {
        env.mutationError = error;
        this.busy = false;
        onClose();
      });
    }
  }

  @action.bound
  private reset() {
    const { milestone } = this.props;
    if (milestone) {
      this.name = milestone.name;
      this.description = milestone.description;
      this.status = milestone.status;
      this.start = new Date(milestone.startDate);
      this.end = new Date(milestone.endDate);
    } else {
      this.name = '';
      this.description = '';
      this.status = MilestoneStatus.Pending;
      this.start = new Date();
      this.end = new Date();
    }
  }
}
