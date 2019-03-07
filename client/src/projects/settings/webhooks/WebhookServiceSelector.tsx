import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { DropdownButton, MenuItem } from '../../../controls';
import { WebhookServiceInfo } from '../../../../../common/types/graphql';
import { ProjectEnv } from '../../../models';
import { styled } from '../../../style';

const WebhookServicesQuery = gql`
  query WebhookServicesQuery {
    webhookServices { serviceName serviceId }
  }
`;

const WebhookServiceDropdown = styled(DropdownButton)`
  min-width: 15rem;
`;

const WebhookServiceMenuItem = styled(MenuItem)`
  min-width: 14.5rem;
`;

interface Props {
  serviceId: string;
  onSelect(serviceId: string): void;
}

export function WebhookServiceSelector({ serviceId, onSelect }: Props) {
  const env = React.useContext(ProjectEnv);
  return (
    <Query query={WebhookServicesQuery} >
      {({ error, data }) => {
        if (data && data.webhookServices) {
          const services: WebhookServiceInfo[] = data.webhookServices;
          const selected = services.find(svc => svc.serviceId === serviceId);
          const title = selected ? selected.serviceName : 'Select Webhook Service';
          return (
            <WebhookServiceDropdown title={title} onSelect={onSelect}>
              {services.map(svc => (
                <WebhookServiceMenuItem key={svc.serviceId} eventKey={svc.serviceId}>
                  {svc.serviceName}
                </WebhookServiceMenuItem>
              ))}
            </WebhookServiceDropdown>
          );
        } else if (error) {
          env.error = error;
        }
        return null;
      }}
    </Query>
  );
}
