import { gql } from 'apollo-server-express';

export const Webhook = gql`

"Types of available webhooks."
type WebhookServiceInfo {
  "ID of hook service."
  serviceId: String!

  "Name of hook service."
  serviceName: String!
}

"Used to create a webhook."
input WebhookInput {
  "Which hook processor to use."
  serviceId: String!

  "ID of the project associated with this commit."
  project: ID!

  "Secret key for this webhook."
  secret: String
}

"Configuration for a webhook."
type Webhook {
  "Database id for this webhook."
  id: ID!

  "Hook service ID."
  serviceId: String!

  "Hook service name."
  serviceName: String!

  "ID of the project associated with this commit."
  project: ID!

  "Secret key for this webhook."
  secret: String

  "Hook URL."
  url: String!

  "When the webhook was created."
  createdAt: DateTime!

  "When the webhook was last updated."
  updatedAt: DateTime!
}
`;
