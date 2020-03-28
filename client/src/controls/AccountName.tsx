import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { PublicAccount } from '../../../common/types/graphql';
import { NavLink } from './NavLink';
import { History as H } from 'history';
import { AccountQuery, AccountQueryResult } from '../graphql';

type DisplayOnly = 'display' | 'account';

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

  const { loading, error, data } = useQuery<AccountQueryResult>(AccountQuery, {
    variables: { id }
  });

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
}
