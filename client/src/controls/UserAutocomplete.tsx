import bind from 'bind-decorator';
import * as React from 'react';
import { Autocomplete } from './Autocomplete';
import { PublicAccount, AccountType } from '../../../common/types/graphql';
import { Chip } from 'skyhook-ui';
import { queryAccounts } from '../graphql';

interface Props {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  multiple?: boolean;
  selection: PublicAccount | PublicAccount[];
  onSelectionChange: (selection: PublicAccount | PublicAccount[] | null) => void;
}

export class UserAutocomplete extends React.Component<Props> {
  private token: string = null;

  public render() {
    return (
      <Autocomplete
          {...this.props}
          onSearch={this.onSearch}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onRenderSelection={this.onRenderSelection}
      />
    );
  }

  @bind
  private onSearch(token: string, callback: (suggestions: PublicAccount[]) => void) {
    this.token = token;
    if (token.length < 1) {
      callback([]);
    } else {
      queryAccounts(token, AccountType.User).then(({ data, loading, errors }) => {
        if (!loading && !errors && token === this.token) {
          callback(data.accounts.slice(0, 5));
        }
      });
    }
  }

  @bind
  private onRenderSuggestion(user: PublicAccount): JSX.Element {
    return (
      <span key={user.id}>
        <span className="name">{user.display}</span>
        &nbsp;- <span className="username">{user.accountName}</span>
      </span>
    );
  }

  @bind
  private onRenderSelection(user: PublicAccount): JSX.Element {
    return (
      <Chip key={user.id} color="#ccc">
        <span className="name">{user.display}</span>
        &nbsp;- <span className="username">{user.accountName}</span>
      </Chip>
    );
  }

  @bind
  private onGetValue(user: PublicAccount): string {
    return user.accountName || user.id;
  }

  @bind
  private onGetSortKey(user: PublicAccount): string {
    return user.display;
  }
}
