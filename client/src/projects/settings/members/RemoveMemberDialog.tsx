import * as React from 'react';
import bind from 'bind-decorator';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { AccountName } from '../../../controls';
import { client, decodeErrorAsException } from '../../../graphql/client';
import { fragments } from '../../../graphql';
import { Mutation } from '../../../../../common/types/graphql';
import gql from 'graphql-tag';
import { Button, Dialog } from 'skyhook-ui';

const RemoveMemberMutation = gql`
  mutation RemoveMemberMutation($project: ID!, $account: ID!) {
    removeProjectMember(project: $project, account: $account) { ...MembershipFields }
  }
  ${fragments.membership}
`;

type RemoveMemberMutationResult = Pick<Mutation, 'removeProjectMember'>;

interface Props {
  user?: string;
  env: ViewContext;
  open: boolean;
  onClose: () => void;
}

@observer
export class RemoveMemberDialog extends React.Component<Props> {
  @observable private busy = false;

  public render() {
    const { open, onClose, user } = this.props;
    return (
      <Dialog
          open={open}
          onClose={onClose}
          className="set-role"
          style={{ minWidth: '25rem' }}
      >
        <Dialog.Header hasClose={true}>
          <span>Remove <AccountName id={user} /> from project?</span>
        </Dialog.Header>
        <Dialog.Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.busy}
              variant="primary"
          >
            Remove
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @bind
  private onSubmit() {
    const { onClose, env, user } = this.props;
    this.busy = true;
    client.mutate<RemoveMemberMutationResult>({
      mutation: RemoveMemberMutation,
      variables: {
        project: env.project.id,
        account: user,
      }
    }).then(({ data, errors }) => {
      this.busy = false;
      onClose();
      if (errors) {
        decodeErrorAsException(errors);
      }
      return data.removeProjectMember;
    }, error => {
      env.mutationError = error;
      this.busy = false;
      onClose();
    });
  }
}
