import * as React from 'react';
import { action, autorun, observable } from 'mobx';
import { observer } from 'mobx-react';
import { client } from '../graphql/client';
import { FormLabel, TextInput } from '../controls';
import gql from 'graphql-tag';
import { Account } from '../../../common/types/graphql';

const accountNameQuery = gql`
  query AccountNameLinkQuery($accountName: String) {
    account(accountName: $accountName, id: null) { accountName }
  }
`;

interface Props {
  initialValue: string;
  value: string;
  error?: string;
  onChangeUsername: (value: string) => void;
  onChangeAvailable: (available: boolean) => void;
}

@observer
export class UsernameEditor extends React.Component<Props> {
  @observable private status: 'success' | 'error' | 'warning' | null = null;
  @observable private message: string = null;

  public componentWillMount() {
    this.validateName(this.props.value);
  }

  public render() {
    const { error } = this.props;
    return (
      <React.Fragment>
        <FormLabel>Username</FormLabel>
        <TextInput
          value={this.props.value}
          onChange={this.onChange}
          maxLength={32}
          placeholder="Choose a unique identifier for your account"
          validationStatus={error ? 'error' : this.status}
          validationMsg={error || this.message}
        />
      </React.Fragment>
    );
  }

  @action.bound
  private onChange(e: any) {
    const value: string = e.target.value.toLowerCase();
    this.props.onChangeUsername(value);
    this.validateName(value);
  }

  private validateName(value: string) {
    if (value === this.props.initialValue) {
      this.status = null;
      this.message = null;
      this.props.onChangeAvailable(false);
    } else if (value.length === 0) {
      this.status = 'error';
      this.message = 'Name cannot be blank';
      this.props.onChangeAvailable(false);
    } else if (value.length < 4) {
      this.status = 'error';
      this.message = 'Longer please';
      this.props.onChangeAvailable(false);
    } else if (!value.match(/^[\w\-\.\_]+$/)) {
      this.status = 'error';
      this.message = 'Invalid character';
      this.props.onChangeAvailable(false);
    } else if (!value.match(/^[a-zA-Z]/)) {
      this.status = 'error';
      this.message = 'Name must start with a letter';
      this.props.onChangeAvailable(false);
    } else {
      this.message = 'Checking availability...';
      autorun(() => {
        client.query({ query: accountNameQuery, variables: { accountName: value }})
        .then(result => {
          if (result.errors) {
            this.status = 'error';
            this.message = 'Error checking name';
          } else if (result.loading) {
            this.status = 'warning';
            this.message = 'Checking...';
          } else {
            const { account } = result.data as { account: Account };
            this.props.onChangeAvailable(!account);
            if (account) {
              this.status = 'error';
              this.message = 'Name is not available';
            } else {
              this.status = 'success';
              this.message = 'Name is available';
            }
          }
        });
      }, { delay: 10 });
    }
  }
}
