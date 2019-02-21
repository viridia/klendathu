import * as React from 'react';
import { Query } from 'react-apollo';
import { PublicAccount } from '../../../common/types/graphql';
import { NavLink } from './NavLink';
import { History as H } from 'history';
import { AccountQuery } from '../graphql';

interface Props {
  id?: string;
  to?: H.LocationDescriptor;
}

export function AccountName({ id, to }: Props) {
  if (id === null || id === undefined) {
    return <span className="account-name unassigned">unassigned</span>;
  }
  return (
    <Query query={AccountQuery} variables={{ id }} >
      {({ loading, error, data }) => {
        if (loading) {
          return <div className="account-name loading" />;
        } else if (error) {
          return <div className="account-name error">[Account Load Error]</div>;
        } else {
          const account: PublicAccount = data.account;
          if (account && account.accountName) {
            const text = account.display || account.accountName;
            if (to) {
              return (
                <NavLink className="account-name" to={to}>{text}</NavLink>
              );
            } else {
              return (
                <span className="account-name">{text}</span>
              );
            }
          } else {
            return <div>[Anonymous user]</div>;
          }
        }
      }}
    </Query>
  );
}
