import gql from 'graphql-tag';
import { fragments } from './fragments';
import { Query, AccountType } from '../../../common/types/graphql';
import { client } from './client';

/** Common queries */

/** Query a single account by id or account name */
export const AccountQuery = gql`
  query AccountQuery($accountName: String, $id: ID) {
    account(accountName: $accountName, id: $id) { ...AccountFields }
  }
  ${fragments.account}
`;

type AccountQueryResult = Pick<Query, 'account'>;

export function queryAccount({ accountName, id }: { accountName?: string, id?: string }) {
  return client.query<AccountQueryResult>({
    query: AccountQuery,
    fetchPolicy: 'network-only',
    variables: {
      accountName,
      id,
    }
  });
}

/** Search multiple accounts */
export const AccountsQuery = gql`
  query AccountsQuery($token: String!, $type: AccountType) {
    accounts(token: $token, type: $type) { ...AccountFields }
  }
  ${fragments.account}
`;

type AccountsQueryResult = Pick<Query, 'accounts'>;

export function queryAccounts(token: string, type: AccountType = AccountType.User) {
  return client.query<AccountsQueryResult>({
    query: AccountsQuery,
    fetchPolicy: 'network-only',
    variables: {
      token,
      type,
    }
  });
}
