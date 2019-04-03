import * as React from 'react';
import bind from 'bind-decorator';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Role } from '../../../../../common/types/json';
import { AccountName, RoleSelector } from '../../../controls';
import { client, decodeErrorAsException } from '../../../graphql/client';
import gql from 'graphql-tag';
import { fragments } from '../../../graphql';
import { Mutation } from '../../../../../common/types/graphql';
import { Button, Dialog, Form, FormLabel, FormControlGroup } from 'skyhook-ui';

const SetRoleMutation = gql`
  mutation SetRoleMutation($project: ID!, $account: ID!, $role: Int!) {
    setProjectRole(project: $project, account: $account, role: $role) { ...MembershipFields }
  }
  ${fragments.membership}
`;

type SetRoleMutationResult = Pick<Mutation, 'setProjectRole'>;

interface Props {
  user?: string;
  env: ViewContext;
  open: boolean;
  onClose: () => void;
}

@observer
export class SetRoleDialog extends React.Component<Props> {
  @observable private role: Role = Role.VIEWER;
  @observable private busy = false;

  public render() {
    const { env, user, open, onClose } = this.props;
    const { project } = env;
    return (
      <Dialog
          open={open}
          onClose={onClose}
          className="set-role"
          style={{ minWidth: '25rem' }}
      >
        <Dialog.Header hasClose={true}>
          <span>Set Project Role for <AccountName id={user} /></span>
        </Dialog.Header>
        <Dialog.Body>
          <Form layout="ledger" onSubmit={this.onSubmit}>
            <FormLabel>
              New Role:
            </FormLabel>
            <FormControlGroup>
              <RoleSelector value={this.role} maxRole={project.role} onChange={this.onSelectRole} />
            </FormControlGroup>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.role === null || this.busy}
              variant="primary"
          >
            Set Role
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @bind
  private onSelectRole(role: Role) {
    this.role = role;
  }

  @bind
  private onSubmit() {
    const { onClose, user, env } = this.props;
    this.busy = true;
    client.mutate<SetRoleMutationResult>({
      mutation: SetRoleMutation,
      variables: {
        project: env.project.id,
        account: user,
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
