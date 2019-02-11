import bind from 'bind-decorator';
import * as React from 'react';
// import { searchAccounts } from '../../network/requests';
import { Autocomplete } from './Autocomplete';
import { PublicAccount } from '../../../common/types/graphql';
import { Chip } from './Chip';

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
      searchAccounts(this.token, { type: 'user', limit: 5 }, accounts => {
        if (token === this.token) {
          callback(accounts);
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
      <Chip key={user.id}>
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
