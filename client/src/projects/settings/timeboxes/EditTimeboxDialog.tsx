import React from 'react';
import { observer } from 'mobx-react';
import { DatePicker } from '../../../controls';
import {
  Timebox,
  TimeboxStatus,
  Mutation,
  TimeboxInput,
  TimeboxType,
} from '../../../../../common/types/graphql';
import { action, observable } from 'mobx';
import { ViewContext } from '../../../models';
import { TimeboxStatusSelector } from './TimeboxStatusSelector';
import { fragments } from '../../../graphql';
import gql from 'graphql-tag';
import { client } from '../../../graphql/client';
import {
  Button,
  Dialog,
  Form,
  FormLabel,
  TextInput,
  AutoNavigate,
  FormControlGroup,
} from 'skyhook-ui';
import { differenceInDays, addDays } from 'date-fns';
import { DurationSelector } from '../../../controls/DurationSelector';

const NewTimeboxMutation = gql`
  mutation NewTimeboxMutation($project: ID!, $input: TimeboxInput!) {
    newTimebox(project: $project, input: $input) { ...TimeboxFields }
  }
  ${fragments.timebox}
`;

type NewTimeboxMutationResult = Pick<Mutation, 'newTimebox'>;

const UpdateTimeboxMutation = gql`
  mutation UpdateTimeboxMutation($id: ID!, $input: TimeboxInput!) {
    updateTimebox(id: $id, input: $input) { ...TimeboxFields }
  }
  ${fragments.timebox}
`;

type UpdateTimeboxMutationResult = Pick<Mutation, 'updateTimebox'>;

interface Props {
  env: ViewContext;
  open: boolean;
  onClose: () => void;
  timebox?: Timebox;
  timeboxType: TimeboxType;
}

@observer
export class EditMilestoneDialog extends React.Component<Props> {
  @observable private name: string = '';
  @observable private description: string = '';
  @observable private status: TimeboxStatus = TimeboxStatus.Pending;
  @observable private start: Date = new Date();
  @observable private end: Date = new Date();
  @observable private busy = false;

  public render() {
    const { open, onClose, timebox, timeboxType } = this.props;
    return (
      <Dialog open={open} onClose={onClose} onOpen={this.reset}>
        <Dialog.Header hasClose={true}>
          {timebox
            ? (timeboxType === TimeboxType.Milestone ? 'Edit Milestone' : 'Edit Sprint')
            : (timeboxType === TimeboxType.Milestone ? 'Add Milestone' : 'Add Sprint')
          }
        </Dialog.Header>
        <Dialog.Body>
          <Form layout="ledger" onSubmit={this.onSave}>
            <AutoNavigate />
            <FormLabel>Name:</FormLabel>
            <TextInput value={this.name} onChange={this.onChangeName} />
            {timeboxType === TimeboxType.Milestone &&
              <React.Fragment>
                <FormLabel>Description:</FormLabel>
                <TextInput value={this.description} onChange={this.onChangeDescription} />
              </React.Fragment>
            }
            <FormLabel>Status:</FormLabel>
            <TimeboxStatusSelector value={this.status} onChange={this.onChangeStatus} />
            {this.status !== TimeboxStatus.Timeless && (
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
                <FormLabel>Duration:</FormLabel>
                <DurationSelector
                  days={differenceInDays(this.end, this.start) + 1}
                  onChange={this.onChangeDuration}
                />
              </React.Fragment>
            )}
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={this.onSave}
            disabled={this.name === null || this.description === null || this.busy}
            variant="primary"
          >
            {timebox ? 'Save' : 'Add'}
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
  private onChangeStatus(status: TimeboxStatus) {
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
  private onChangeDuration(days: number) {
    this.end = addDays(this.start, days - 1);
  }

  @action.bound
  private onSave() {
    const { onClose, env } = this.props;
    this.busy = true;
    const input: TimeboxInput = {
      name: this.name,
      type: this.props.timeboxType,
      description: this.description,
      status: this.status,
      startDate: this.status === TimeboxStatus.Timeless ? null : this.start,
      endDate: this.status === TimeboxStatus.Timeless ? null : this.end,
    };

    if (this.props.timebox) {
      client.mutate<UpdateTimeboxMutationResult>({
        mutation: UpdateTimeboxMutation,
        variables: {
          id: this.props.timebox.id,
          input,
        }
      }).then(({ data, errors }) => {
        this.busy = false;
        onClose();
        if (errors) {
          env.error = errors[0];
        }
        return data.updateTimebox;
      }, error => {
        env.mutationError = error;
        this.busy = false;
        onClose();
      });
    } else {
      client.mutate<NewTimeboxMutationResult>({
        mutation: NewTimeboxMutation,
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
        return data.newTimebox;
      }, error => {
        env.mutationError = error;
        this.busy = false;
        onClose();
      });
    }
  }

  @action.bound
  private reset() {
    const { timebox, timeboxType, env } = this.props;
    if (timebox) {
      this.name = timebox.name;
      this.description = timebox.description;
      this.status = timebox.status;
      this.start = new Date(timebox.startDate);
      this.end = new Date(timebox.endDate);
    } else {
      // Find the most recent timebox of this type
      const timeboxes = env.timeboxes.filter(
        tb => tb.type === timeboxType && tb.status !== TimeboxStatus.Timeless);

      this.name = '';
      this.description = '';
      this.status = TimeboxStatus.Pending;
      this.start = new Date();
      this.end = this.start;

      // Default the timebox interval to follow the newest timebox of the same type, with the
      // same duration.
      if (timeboxes.length > 0) {
        const last = timeboxes[timeboxes.length - 1];
        this.start = addDays(last.endDate, 1);
        this.end = addDays(this.start, differenceInDays(last.endDate, last.startDate));
        // TODO: You know, we could auto-increment the name as well...
      }
    }
  }
}
