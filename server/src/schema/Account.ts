import { gql } from 'apollo-server-express';

export const Account = gql`
enum AccountType {
  USER,
  ORGANIZATION,
}

"Information about a user or organization."
type Account {
  "Database id this user or organization."
  id: ID!

  "Unique, user-visible account name of this user or organization."
  accountName: String!

  "Display name of this user or organization."
  display: String!

  "Whether this is a person or an organization."
  type: AccountType!

  "Profile photo (URL)."
  photo: String

  "User email address."
  email: String

  "Whether this account has been verified. Non-verified accounts have limited access."
  verified: Boolean!
}

input AccountInput {
  "Unique, user-visible account name of the account being changed."
  accountName: String!

  "Display name of this user or organization."
  display: String

  "Profile photo (URL)."
  photo: String

  "User email address."
  email: String
}
`;
