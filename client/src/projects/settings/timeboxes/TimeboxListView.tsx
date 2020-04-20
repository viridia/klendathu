import React from 'react';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Timebox, TimeboxStatus, TimeboxType } from '../../../../../common/types/graphql';
import { Role } from '../../../../../common/types/json';
import { Button, DropdownButton, MenuItem } from 'skyhook-ui';
import { CardTitle } from '../../../controls';
import {
  SettingsPane,
  Spacer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  ActionButtonCell,
} from '../../../layout';
import classNames from 'classnames';
import { observable, action, computed } from 'mobx';
import { format } from 'date-fns';
import { EditMilestoneDialog } from './EditTimeboxDialog';
import { DeleteTimeboxDialog } from './DeleteTimeboxDialog';
import styled from 'styled-components';
import { MilestoneColors } from '../../../style/milestoneColors';
import { ProgressBar } from '../../../controls/widgets';

const TimeboxTypeDropdown = styled(DropdownButton)`
  width: 10rem;
  margin-left: 8px;
`;

const TimeboxStatusDisplay = styled.div`
  padding: 4px;

  &.active {
    background-color: ${MilestoneColors.ACTIVE};
  }

  &.timeless {
    background-color: ${MilestoneColors.TIMELESS};
  }

  &.pending {
    background-color: ${MilestoneColors.PENDING};
  }

  &.concluded {
    background-color: ${MilestoneColors.CONCLUDED};
  }
`;

const TimeboxProgress = styled(ProgressBar)`
  min-width: 10rem;
  width: 100%;
`;

const EmptyList = styled.div`
  margin: 1rem;
  font-style: italic;
`;

interface Props {
  env: ViewContext;
}

const timeboxTypes = {
  [TimeboxType.Milestone]: 'Milestone',
  [TimeboxType.Sprint]: 'Sprint',
};

@observer
export class TimeboxListView extends React.Component<Props> {
  @observable private timeboxType = TimeboxType.Milestone;
  @observable private showEdit = false;
  @observable private showDelete = false;
  @observable private milestoneToEdit: Timebox = null;

  public render() {
    const { env } = this.props;
    const { project } = env;
    return (
      <SettingsPane>
        <EditMilestoneDialog
          env={env}
          open={this.showEdit}
          onClose={this.onHideEdit}
          timebox={this.milestoneToEdit}
          timeboxType={this.timeboxType}
        />
        <DeleteTimeboxDialog
          open={this.showDelete}
          onClose={this.onHideDelete}
          timebox={this.milestoneToEdit}
        />
        <header>
          <CardTitle>Timebox Type:</CardTitle>
          <TimeboxTypeDropdown
            id="timebox-type-selector"
            title={timeboxTypes[this.timeboxType]}
            onSelect={state => { this.timeboxType = state as TimeboxType; }}
          >
            {Object.keys(timeboxTypes).map(tt => (
              <MenuItem key={tt} checked={tt === this.timeboxType} eventKey={tt}>
                {timeboxTypes[tt as TimeboxType]}
              </MenuItem>
            ))}
          </TimeboxTypeDropdown>
          <Spacer/>
          {project.role >= Role.MANAGER &&
            <Button variant="primary" onClick={this.onShowAdd}>Add&hellip;</Button>}
        </header>
        <Table className="fullwidth project-timebox-list">
          <TableHead>
            <TableRow className="heading">
              <th className="name left pad">Name</th>
              <th className="status center pad">Status</th>
              <th className="start center pad">Start</th>
              <th className="end center pad">End</th>
              <th className="completion center pad">Progress</th>
              <th className="actions right pad">Actions</th>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.timeboxes.map(m => this.renderMember(m))}
          </TableBody>
        </Table>
        {this.timeboxes.length === 0 &&
          (this.timeboxType === TimeboxType.Milestone
            ? <EmptyList>No milestones defined.</EmptyList>
            : <EmptyList>No sprints defined.</EmptyList>
          )
        }
      </SettingsPane>);
  }

  private renderMember(timebox: Timebox) {
    return (
      <TableRow key={timebox.id}>
        <td className="name left pad">
          <b>{timebox.name}</b>
          {timebox.description && ' - '}
          {timebox.description}
        </td>
        <td className={classNames('status center pad', timebox.status)}>
          <TimeboxStatusDisplay className={classNames('mstatus', timebox.status.toLowerCase())}>
            {timebox.status}
          </TimeboxStatusDisplay>
        </td>
        <td className="start center pad">
          {timebox.status !== TimeboxStatus.Timeless && timebox.startDate ?
            format(timebox.startDate, 'MM/DD/YYYY') : null}
        </td>
        <td className="end center pad">
          {timebox.status !== TimeboxStatus.Timeless && timebox.endDate ?
            format(timebox.endDate, 'MM/DD/YYYY') : null}
        </td>
        <td className="completion center pad">
          {timebox.status !== TimeboxStatus.Timeless &&
            <TimeboxProgress value={50}>0 / 0</TimeboxProgress>
          }
        </td>
        <ActionButtonCell className="right">
          <Button
            onClick={(e: any) => {
              this.milestoneToEdit = timebox;
              this.showEdit = true;
            }}
          >
            Edit
          </Button>
          <Button
            onClick={(e: any) => {
              this.milestoneToEdit = timebox;
              this.showDelete = true;
            }}
          >
            Delete
          </Button>
        </ActionButtonCell>
      </TableRow>
    );
  }

  @action.bound
  private onShowAdd(e: any) {
    e.preventDefault();
    this.milestoneToEdit = null;
    this.showEdit = true;
  }

  @action.bound
  private onHideEdit() {
    this.showEdit = false;
  }

  @action.bound
  private onHideDelete() {
    this.showDelete = false;
  }

  @computed
  private get timeboxes() {
    const { env } = this.props;
    return env.sortedTimeboxes
      .filter(m => m.type === this.timeboxType);
  }
}
