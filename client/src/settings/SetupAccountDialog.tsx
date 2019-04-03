import * as React from 'react';
import { Errors } from '../../../common/types/json';
import { UsernameEditor } from './UsernameEditor';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { session } from '../models';
import { Button, Dialog, Form, AutoNavigate, FormLabel, TextInput } from 'skyhook-ui';
import { client, decodeError } from '../graphql/client';
import { styled } from '../style';
import gql from 'graphql-tag';

const noop: () => void = () => null;

const changeAccountMutation = gql`
  mutation ChangeAccountMutation($input: AccountInput) {
    updateAccount(input: $input) { id, accountName, display, photo }
  }
`;

const SetupAccountForm = styled(Form)`
  input {
    width: 24em;
  }

  .label {
    margin-left: 5em;
  }
`;

const DialogText = styled.section`
  width: 35em;

  > p {
    margin-top: 0;
  }
`;

@observer
export class SetupAccountDialog extends React.Component<{}> {
  @observable private busy = false;
  @observable private available = false;
  @observable private displayName: string = '';
  @observable private displayNameError: string = '';
  @observable private username: string = '';
  @observable private usernameError: string = '';

  public componentWillMount() {
    this.displayName = session.account.display || '';
    this.username = session.account.accountName || '';
    if (!this.username && session.account.email) {
      const m = session.account.email.match(/[A-Za-z][\w\-\.\_]*/);
      if (m) {
        this.username = m[0];
      }
    }
  }

  public render() {
    return (
      <Dialog className="account-setup-dialog" onClose={noop} open={true}>
        <Dialog.Header>User Account Setup</Dialog.Header>
        <Dialog.Body>
          <DialogText>
            <p>
              To complete your account setup, make sure your name appears the way you would like
              it to be presented.
            </p>
            <p>
              You will also need to choose a unique username.
            </p>
          </DialogText>
          <SetupAccountForm onSubmit={this.onClickSave}>
            <AutoNavigate />
            <FormLabel className="label">Name</FormLabel>
            <TextInput
                value={this.displayName}
                onChange={this.onChangeDisplayName}
                maxLength={64}
                placeholder="How you want your name to be displayed"
                autoFocus={true}
                validationStatus={this.displayNameError ? 'error' : null}
                validationMsg={this.displayNameError}
            />
            <UsernameEditor
                initialValue=""
                value={this.username}
                error={this.usernameError}
                onChangeUsername={this.onChangeUsername}
                onChangeAvailable={this.onChangeAvailable}
            />
          </SetupAccountForm>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="default" onClick={this.onClickCancel}>
            Cancel
          </Button>
          <Button
              variant="primary"
              disabled={this.busy || !this.available || this.displayName.length < 1}
              onClick={this.onClickSave}
          >
            Save
          </Button>
        </Dialog.Footer>
      </Dialog>
    );
  }

  @action.bound
  private onChangeUsername(username: string) {
    this.username = username;
    this.usernameError = '';
  }

  @action.bound
  private onChangeAvailable(available: boolean) {
    this.available = available;
  }

  @action.bound
  private onChangeDisplayName(e: any) {
    this.displayName = e.target.value;
  }

  @action.bound
  private onClickSave(e: any) {
    // console.log('save');
    e.preventDefault();
    if (this.busy || !this.available || this.displayName.length < 1) {
      return;
    }
    this.busy = true;
    client.mutate({
      mutation: changeAccountMutation,
      variables: {
        input: {
          accountName: this.username,
          display: this.displayName,
        }
      },
    }).then(result => {
      console.debug(result);
      session.reload();
      this.busy = false;
    }, error => {
      this.busy = false;
      const [code, field] = decodeError(error);
      switch (code) {
        case Errors.TEXT_MISSING:
          if (field === 'display') {
            this.displayNameError = 'Missing display name';
          } else if (field === 'accountName') {
            this.usernameError = 'Username must be at least 4 characters';
          }
          break;
        case Errors.TEXT_TOO_SHORT:
          if (field === 'display') {
            this.displayNameError = 'Display name must be at least 4 characters';
          } else if (field === 'accountName') {
            this.usernameError = 'Username must be at least 4 characters';
          }
          break;
        case Errors.TEXT_INVALID_CHARS:
          if (field === 'accountName') {
            this.usernameError = 'Invalid character in username';
          }
          break;
        case Errors.USERNAME_LOWER_CASE:
          this.usernameError = 'Username must be all lower case';
          break;
        case Errors.EXISTS:
        case Errors.CONFLICT:
          this.usernameError = 'Username already exists';
          break;
        default:
          console.error(error);
          this.usernameError = code;
          break;
      }
    });
  }

  @action.bound
  private onClickCancel() {
    session.logout();
  }
}
