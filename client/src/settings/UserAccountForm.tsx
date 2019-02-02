import * as React from 'react';
import { request, session } from '../models';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';
import { Form, FormLabel, TextInput, Button, PhotoSelect } from '../controls';
import { SettingsPane, SettingsPaneContent } from './SettingsPane';
import { styled } from '../style';

import DefaultAvatar from '../icons/default-avatar.png';
import { FormControlGroup } from '../controls/Form';

const LayoutEl = styled.section`
  align-self: flex-start;
  align-items: flex-start;
  display: flex;
  flex-direction: row;

  > form {
    align-items: flex-end;
    margin-right: 1rem;
    padding-right: 1rem;

    input {
      width: 20rem;
    }
  }
`;

@observer
export class UserAccountForm extends React.Component<{}> {
  @observable private displayName: string;
  @observable private displayNameError: string;

  public render() {
    return (
      <SettingsPane>
        <header>
          <span>Account settings for user:&nbsp;</span>
          <b>{session.account.accountName}</b>
        </header>
        <SettingsPaneContent>
          <LayoutEl>
            <Form onSubmit={this.onClickSave}>
              <FormLabel>Display Name</FormLabel>
              <TextInput
                  value={this.displayName}
                  onChange={this.onChangeDisplayName}
                  maxLength={64}
                  placeholder="How you want your name to be displayed"
                  validationStatus={this.displayNameError ? 'error' : null}
                  validationMsg={this.displayNameError}
                  autoFocus={true}
              />
              <FormControlGroup>
                <Button kind="primary" onClick={this.onClickSave}>
                  Save
                </Button>
              </FormControlGroup>
            </Form>
            <PhotoSelect
                className="round"
                value={session.account.photo}
                defaultPhoto={DefaultAvatar}
                onChange={this.upload}
            />
          </LayoutEl>
        </SettingsPaneContent>
      </SettingsPane>
    );
  }

  @action.bound
  private onChangeDisplayName(e: any) {
    this.displayName = e.target.value;
  }

  @action.bound
  private onClickSave(e: any) {
    e.preventDefault();
    alert('Implement save');
    // this.displayName = e.target.value;
  }

  /** Begin uploading the file, returns a promise. */
  private upload(file: File) {
    const formData = new FormData();
    formData.append('attachment', file);
    return request.post(`/api/photo/${session.account.id}`, formData, {
      // onUploadProgress: this.onProgress,
    }).then(resp => {
      return request.patch(`/api/accounts/me`, {
        photo: resp.data.url,
      }).then(() => {
        session.reload();
      });
    }, error => {
      toast.error('Upload failed');
      console.error('upload photo error:', error);
    });
  }
}
