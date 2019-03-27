import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Milestone, MilestoneStatus } from '../../../../../common/types/graphql';
import { Role } from '../../../../../common/types/json';
import { Button, CardTitle, ProgressBar } from '../../../controls';
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
import { observable, action } from 'mobx';
import { format } from 'date-fns';
import { EditMilestoneDialog } from './EditMilestoneDialog';
import { DeleteMilestoneDialog } from './DeleteMilestoneDialog';
import styled from 'styled-components';
import { MilestoneColors } from '../../../style/milestoneColors';

const MilestoneStatusDisplay = styled.div`
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

const MilestoneProgress = styled(ProgressBar)`
  min-width: 10rem;
  width: 100%;
`;

interface Props {
  env: ViewContext;
}

@observer
export class MilestoneListView extends React.Component<Props> {
  @observable private showEdit = false;
  @observable private showDelete = false;
  @observable private milestoneToEdit: Milestone = null;

  public render() {
    const { env } = this.props;
    const { project } = env;
    return (
      <SettingsPane>
        <EditMilestoneDialog
            env={env}
            open={this.showEdit}
            onClose={this.onHideEdit}
            milestone={this.milestoneToEdit}
        />
        <DeleteMilestoneDialog
            open={this.showDelete}
            onClose={this.onHideDelete}
            milestone={this.milestoneToEdit}
        />
        <header>
          <CardTitle>Milestones</CardTitle>
          <Spacer/>
          {project.role >= Role.MANAGER &&
            <Button kind="primary" onClick={this.onShowAdd}>Add&hellip;</Button>}
        </header>
        <Table className="fullwidth project-milestone-list">
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
            {env.sortedMilestones.map(m => this.renderMember(m))}
          </TableBody>
        </Table>
      </SettingsPane>);
  }

  private renderMember(milestone: Milestone) {
    return (
      <TableRow key={milestone.id}>
        <td className="name left pad">
          <b>{milestone.name}</b>
          {milestone.description && ' - '}
          {milestone.description}
        </td>
        <td className={classNames('status center pad', milestone.status)}>
          <MilestoneStatusDisplay className={classNames('mstatus', milestone.status.toLowerCase())}>
            {milestone.status}
          </MilestoneStatusDisplay>
        </td>
        <td className="start center pad">
          {milestone.status !== MilestoneStatus.Timeless && milestone.startDate ?
              format(milestone.startDate, 'MM/DD/YYYY') : null}
        </td>
        <td className="end center pad">
          {milestone.status !== MilestoneStatus.Timeless && milestone.endDate ?
            format(milestone.endDate, 'MM/DD/YYYY') : null}
        </td>
        <td className="completion center pad">
          {milestone.status !== MilestoneStatus.Timeless &&
            <MilestoneProgress value={50}>0 / 0</MilestoneProgress>
          }
        </td>
        <ActionButtonCell className="right">
          <Button
            onClick={(e: any) => {
              this.milestoneToEdit = milestone;
              this.showEdit = true;
            }}
          >
            Edit
          </Button>
          <Button
            onClick={(e: any) => {
              this.milestoneToEdit = milestone;
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
}
