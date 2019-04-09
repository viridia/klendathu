import * as React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Role } from '../../../../../common/types/json';
import { UserAutocomplete, RoleSelector } from '../../../controls';
import { PublicAccount, Mutation } from '../../../../../common/types/graphql';
import { fragments } from '../../../graphql';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { client } from '../../../graphql/client';
import { decodeErrorAsException } from '../../../graphql/__mocks__/client';
import { Button, Dialog } from 'skyhook-ui';

const AddMemberMutation = gql`
  mutation AddMemberMutation($project: ID!, $account: ID!, $role: Int!) {
    setProjectRole(project: $project, account: $account, role: $role) { ...MembershipFields }
  }
  ${fragments.membership}
`;

type AddMemberMutationResult = Pick<Mutation, 'setProjectRole'>;

const BodyLayout = styled.section`
  display: flex;
  flex-direction: row;

  > .user {
    margin-right: .5rem;
    width: 20rem;
  }
`;

interface Props {
  env: ViewContext;
  open: boolean;
  onClose: () => void;
}

@observer
export class AddMemberDialog extends React.Component<Props> {
  @observable private role: Role = Role.VIEWER;
  @observable private user: PublicAccount = null;
  @observable private busy = false;

  public render() {
    const { env, open, onClose } = this.props;
    const { project } = env;
    return (
      <Dialog
        open={open}
        onOpen={this.onOpen}
        onClose={onClose}
        className="add-member"
      >
        <Dialog.Header hasClose={true}>Add Project Member</Dialog.Header>
        <Dialog.Body>
          <BodyLayout>
            <UserAutocomplete
              placeholder="select user..."
              className="user"
              selection={this.user}
              autoFocus={true}
              onSelectionChange={this.onChangeUser}
            />
            <RoleSelector value={this.role} maxRole={project.role} onChange={this.onSelectRole} />
          </BodyLayout>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={this.onAddMember}
            disabled={this.user === null || this.role === null || this.busy}
            variant="primary"
          >
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @action.bound
  private onOpen() {
    this.user = null;
    this.role = Role.VIEWER;
  }

  @action.bound
  private onChangeUser(selection: PublicAccount) {
    this.user = selection;
  }

  @action.bound
  private onSelectRole(role: Role) {
    this.role = role;
  }

  @action.bound
  private onAddMember() {
    const { onClose, env } = this.props;
    this.busy = true;
    client.mutate<AddMemberMutationResult>({
      mutation: AddMemberMutation,
      variables: {
        project: env.project.id,
        account: this.user.id,
        role: this.role,
      }
    }).then(({ data, errors }) => {
      this.busy = false;
      onClose();
      if (errors) {
        decodeErrorAsException(errors);
      }
      return data.setProjectRole;
    }, error => {
      env.mutationError = error;
      this.busy = false;
      onClose();
    });
  }
}
