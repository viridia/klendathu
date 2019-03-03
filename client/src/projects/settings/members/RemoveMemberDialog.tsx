import * as React from 'react';
import bind from 'bind-decorator';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Dialog, AccountName, Button } from '../../../controls';
import { client, decodeErrorAsException } from '../../../graphql/client';
import { fragments } from '../../../graphql';
import { Mutation } from '../../../../../common/types/graphql';
import gql from 'graphql-tag';

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
  onHide: () => void;
}

@observer
export class RemoveMemberDialog extends React.Component<Props> {
  @observable private busy = false;

  public render() {
    const { open, onHide, user } = this.props;
    return (
      <Dialog
          open={open}
          onClose={onHide}
          className="set-role"
          style={{ minWidth: '25rem' }}
      >
        <Dialog.Header hasClose={true}>
          <span>Remove <AccountName id={user} /> from project?</span>
        </Dialog.Header>
        <Dialog.Footer>
          <Button onClick={onHide}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.busy}
              kind="primary"
          >
            Remove
          </Button>
        </Dialog.Footer>
      </Dialog>);
  }

  @bind
  private onSubmit() {
    const { onHide, env, user } = this.props;
    this.busy = true;
    client.mutate<RemoveMemberMutationResult>({
      mutation: RemoveMemberMutation,
      variables: {
        project: env.project.id,
        account: user,
      }
    }).then(({ data, errors }) => {
      this.busy = false;
      onHide();
      if (errors) {
        decodeErrorAsException(errors);
      }
      return data.removeProjectMember;
    }, error => {
      env.mutationError = error;
      this.busy = false;
      onHide();
    });
  }
}
