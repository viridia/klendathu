import * as React from 'react';
import { AddMemberDialog } from './AddMemberDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { SetRoleDialog } from './SetRoleDialog';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext, session } from '../../../models';
import { Membership } from '../../../../../common/types/graphql';
import { Role } from '../../../../../common/types/json';
import { Button } from 'skyhook-ui';
import { AccountName, RoleName, CardTitle } from '../../../controls';
import {
  SettingsPane,
  Spacer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  ActionButtonCell,
} from '../../../layout';
import bind from 'bind-decorator';

interface Props {
  env: ViewContext;
  members: Membership[];
}

@observer
export class ProjectMemberList extends React.Component<Props> {
  @observable private showAddMember = false;
  @observable private setRoleUser: string = null;
  @observable private removeMemberUser: string = null;

  public render() {
    const { env, members } = this.props;
    const { project } = env;
    return (
      <SettingsPane>
        <AddMemberDialog env={env} open={this.showAddMember} onClose={this.onHideAddMember}/>
        <SetRoleDialog
          user={this.setRoleUser}
          env={env}
          open={!!this.setRoleUser}
          onClose={this.onHideSetRole}
        />
        <RemoveMemberDialog
          user={this.removeMemberUser}
          env={env}
          open={!!this.removeMemberUser}
          onClose={this.onHideRemoveMember}
        />
        <header>
          <CardTitle>Project members</CardTitle>
          <Spacer/>
          {project.role >= Role.DEVELOPER &&
            <Button variant="primary" onClick={this.onShowAddMember}>Add Member</Button>}
        </header>
        <Table className="fullwidth project-member-list">
          <TableHead>
            <TableRow className="heading">
              <th className="name left pad">Name</th>
              <th className="uname left pad">UserId</th>
              <th className="role left pad">Role</th>
              <th className="actions right pad">Actions</th>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map(m => this.renderMember(m))}
          </TableBody>
        </Table>
      </SettingsPane>);
  }

  private renderMember(member: Membership) {
    const { project } = this.props.env;
    // TODO: Require at least one administrator.
    const disabled =
        project.role < Role.MANAGER ||
        project.role < member.role ||
        member.user === session.account.id;
    return (
      <TableRow key={member.user}>
        <td className="display left pad"><AccountName id={member.user} only="display" /></td>
        <td className="account left pad"><AccountName id={member.user} only="account" /></td>
        <td className="role left pad"><RoleName role={member.role} /></td>
        <ActionButtonCell className="right">
          &nbsp;
          {project.role >= Role.MANAGER && (
            <Button
              size="smaller"
              variant="action"
              disabled={disabled}
              onClick={() => { this.onShowSetRole(member.user); }}
            >
              Change&hellip;
            </Button>
          )}
          {project.role >= Role.MANAGER && (
            <Button
              size="smaller"
              variant="action"
              disabled={disabled}
              onClick={() => { this.onShowRemoveMember(member.user); }}
            >
              Remove
            </Button>
          )}
        </ActionButtonCell>
      </TableRow>
    );
  }

  @bind
  private onShowAddMember(e: any) {
    e.preventDefault();
    this.showAddMember = true;
  }

  @bind
  private onHideAddMember() {
    this.showAddMember = false;
  }

  @bind
  private onShowSetRole(user: string) {
    this.setRoleUser = user;
  }

  @bind
  private onHideSetRole() {
    this.setRoleUser = null;
  }

  @bind
  private onShowRemoveMember(user: string) {
    this.removeMemberUser = user;
  }

  @bind
  private onHideRemoveMember() {
    this.removeMemberUser = null;
  }
}
