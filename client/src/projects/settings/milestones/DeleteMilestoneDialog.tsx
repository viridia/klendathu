import * as React from 'react';
import { Dialog } from '../../../controls';
import { Milestone, Mutation } from '../../../../../common/types/graphql';
import { ViewContext, ProjectEnv } from '../../../models';
import { fragments } from '../../../graphql';
import { client } from '../../../graphql/client';
import gql from 'graphql-tag';
import { Button } from 'skyhook-ui';

const DeleteMilestoneMutation = gql`
  mutation DeleteMilestoneMutation($id: ID!) {
    deleteMilestone(id: $id) { ...MilestoneFields }
  }
  ${fragments.milestone}
`;

type DeleteMilestoneMutationResult = Pick<Mutation, 'deleteMilestone'>;

function deleteMilestone(milestone: Milestone, env: ViewContext): Promise<void> {
  return client.mutate<DeleteMilestoneMutationResult>({
    mutation: DeleteMilestoneMutation,
    variables: { id: milestone.id }
  }).then(({ data, errors }) => {
    if (errors) {
      env.error = errors[0];
    }
    return;
  }, error => {
    env.mutationError = error;
  });
}

interface Props {
  open: boolean;
  onClose: () => void;
  milestone?: Milestone;
}

export function DeleteMilestoneDialog({ open, onClose, milestone }: Props) {
  const env = React.useContext(ProjectEnv);
  const [busy, setBusy] = React.useState(false);
  if (!milestone) {
    return null;
  }
  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Header hasClose={true}>Delete Project Milestone</Dialog.Header>
      <Dialog.Body>
        Are you sure you want to delete milestone {milestone.name}?
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onClose}>Cancel</Button>
        <Button
            onClick={() => {
              setBusy(true);
              deleteMilestone(milestone, env).then(() => {
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
