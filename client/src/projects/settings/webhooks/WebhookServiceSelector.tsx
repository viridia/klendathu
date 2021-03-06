import React from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { WebhookServiceInfo } from '../../../../../common/types/graphql';
import { ProjectEnv } from '../../../models';
import { styled } from '../../../style';
import { DropdownButton, MenuItem } from 'skyhook-ui';

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
  const { error, data } = useQuery(WebhookServicesQuery);
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
}
