import * as React from 'react';
import { Timebox, Mutation } from '../../../../../common/types/graphql';
import { ViewContext, ProjectEnv } from '../../../models';
import { fragments } from '../../../graphql';
import { client } from '../../../graphql/client';
import gql from 'graphql-tag';
import { Button, Dialog } from 'skyhook-ui';

const DeleteTimeboxMutation = gql`
  mutation DeleteTimeboxMutation($id: ID!) {
    deleteTimebox(id: $id) { ...TimeboxFields }
  }
  ${fragments.timebox}
`;

type DeleteTimeboxMutationResult = Pick<Mutation, 'deleteTimebox'>;

function deleteTimebox(timebox: Timebox, env: ViewContext): Promise<void> {
  return client.mutate<DeleteTimeboxMutationResult>({
    mutation: DeleteTimeboxMutation,
    variables: { id: timebox.id }
  }).then(({ /* data, */ errors }) => {
    if (errors) {
      env.error = errors[0];
    }
  }, error => {
    env.mutationError = error;
  });
}

interface Props {
  open: boolean;
  onClose: () => void;
  timebox?: Timebox;
}

export function DeleteTimeboxDialog({ open, onClose, timebox }: Props) {
  const env = React.useContext(ProjectEnv);
  const [busy, setBusy] = React.useState(false);
  if (!timebox) {
    return null;
  }
  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Header hasClose={true}>Delete Project Milestone</Dialog.Header>
      <Dialog.Body>
        Are you sure you want to delete milestone {timebox.name}?
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            setBusy(true);
            deleteTimebox(timebox, env).then(() => {
              setBusy(false);
              onClose();
            });
          }}
          disabled={busy}
          variant="primary"
        >
          Delete
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
