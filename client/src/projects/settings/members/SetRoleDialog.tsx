import * as React from 'react';
import bind from 'bind-decorator';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Role } from '../../../../../common/types/json';
import {
  Dialog,
  AccountName,
  RoleSelector,
  Button,
  FormLabel,
  Form,
  FormControlGroup,
} from '../../../controls';
import { client, decodeErrorAsException } from '../../../graphql/client';
import gql from 'graphql-tag';
import { fragments } from '../../../graphql';
import { Mutation } from '../../../../../common/types/graphql';

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
  onHide: () => void;
}

@observer
export class SetRoleDialog extends React.Component<Props> {
  @observable private role: Role = Role.VIEWER;
  @observable private busy = false;

  public render() {
    const { env, user, open, onHide } = this.props;
    const { project } = env;
    return (
      <Dialog
          open={open}
          onClose={onHide}
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
          <Button onClick={onHide}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.role === null || this.busy}
              kind="primary"
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
    const { onHide, user, env } = this.props;
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
      onHide();
      if (errors) {
        decodeErrorAsException(errors);
      }
      return data.setProjectRole;
    }, error => {
      env.mutationError = error;
      this.busy = false;
      onHide();
    });
  }
}