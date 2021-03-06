import * as React from 'react';
import { ProjectEnv } from '../../../models';
import gql from 'graphql-tag';
import { fragments, ErrorDisplay } from '../../../graphql';
import { useQuery } from '@apollo/client';
import { Webhook } from '../../../../../common/types/graphql';
import { EmptyList, TableHead, Table, TableBody, ActionButtonCell } from '../../../layout';
import { RelativeDate } from '../../../controls';
import { styled } from '../../../style';
import { Button } from 'skyhook-ui';

const WebhooksQuery = gql`
  query WebhooksQuery($project: ID!) {
    webhooks(project: $project) { ...WebhookFields }
  }
  ${fragments.webhook}
`;

const UrlSpan = styled.span`
  font-family: monospace;
`;

interface Props {
  onShowEdit: (wh: Webhook) => void;
  onShowDelete: (wh: Webhook) => void;
}

export function WebhooksList({ onShowEdit, onShowDelete }: Props) {
  const env = React.useContext(ProjectEnv);
  const { project } = env;
  const { loading, error, data } = useQuery(WebhooksQuery, {
    variables: {
      project: project.id,
    },
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !(data && data.labels)) {
    // Only display loading indicator if nothing in cache.
    return <div>loading&hellip;</div>;
  } else if (error) {
    return <ErrorDisplay error={error} />;
  } else {
    const webhooks: Webhook[] = data.webhooks;
    if (webhooks.length === 0) {
      return (
        <EmptyList>No webhooks defined.</EmptyList>
      );
    }
    return (
      <Table>
        <TableHead>
          <tr>
            <th className="pad">Service</th>
            <th className="pad">URL</th>
            <th className="pad">Created</th>
            <th className="pad">Actions</th>
          </tr>
        </TableHead>
        <TableBody>
          {webhooks.map(wh => (
            <tr key={wh.id}>
              <td className="pad center">{wh.serviceName}</td>
              <td className="pad center">
                <UrlSpan>{wh.url}</UrlSpan>
              </td>
              <td className="pad center"><RelativeDate date={wh.createdAt} /></td>
              <ActionButtonCell className="right">
                <Button
                  variant="default"
                  className="small"
                  onClick={e => onShowEdit(wh)}
                >
                  Edit
                </Button>
                <Button
                  variant="action"
                  className="small"
                  onClick={e => onShowDelete(wh)}
                >
                  Delete
                </Button>
              </ActionButtonCell>
            </tr>
          ))}
        </TableBody>
      </Table>
    );
  }
}
