import * as React from 'react';
import { Query } from 'react-apollo';
import { PublicAccount } from '../../../common/types/graphql';
import { NavLink } from './NavLink';
import { History as H } from 'history';
import { AccountQuery } from '../graphql';
import { Query as Q } from '../../../common/types/graphql';

type DisplayOnly = 'display' | 'account';
type Data = Pick<Q, 'account'>;

interface Props {
  id?: string;
  to?: H.LocationDescriptor;
  only?: DisplayOnly;
}

function formatAccountName(account: PublicAccount, only: DisplayOnly) {
  if (only === 'display') {
    return account.display || '';
  } else if (only === 'account') {
    return account.accountName || '';
  } else {
    return account.display || account.accountName;
  }
}

export function AccountName({ id, to, only }: Props) {
  if (id === null || id === undefined) {
    return <span className="account-name unassigned">unassigned</span>;
  }
  return (
    <Query<Data> query={AccountQuery} variables={{ id }} >
      {({ loading, error, data }) => {
        if (loading) {
          return <div className="account-name loading" />;
        } else if (error) {
          return <div className="account-name error">[Account Load Error]</div>;
        } else {
          const account: PublicAccount = data.account;
          if (account && account.accountName) {
            const text = formatAccountName(account, only);
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
