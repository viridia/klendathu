import * as React from 'react';
import { Query } from 'react-apollo';
import { PublicAccount } from '../../../common/types/graphql';
import { NavLink } from './NavLink';
import gql from 'graphql-tag';

const accountQuery = gql`
  query AccountQuery($accountName: String, $id: ID) {
    account(accountName: $accountName, id: $id) { id, accountName, type, display, photo }
  }
`;

interface Props {
  id?: string;
}

export function AccountName({ id }: Props) {
  return (
    <Query query={accountQuery} variables={{ id }} >
      {({ loading, error, data }) => {
        if (loading) {
          return <div className="account-name loading" />;
        } else if (error) {
          return <div className="account-name error">[Account Load Error]</div>;
        } else {
          const account: PublicAccount = data.account;
          if (account.accountName) {
            if (account.display) {
              return (
                <NavLink className="account-name" to={`/${account.accountName}`}>
                  {account.display}
                </NavLink>
              );
            } else {
              return (
                <NavLink className="account-name" to={`/${account.accountName}`}>
                  {account.accountName}
                </NavLink>);
            }
          } else {
            return <div>[Anonymous user]</div>;
          }
        }
      }}
    </Query>
  );
}
