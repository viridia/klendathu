import * as React from 'react';
import { session } from '../models';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { SettingsPane, SettingsPaneContent } from '../layout/SettingsPane';
import { FormLabel, TextInput, Form } from 'skyhook-ui';

@observer
export class OrganizationForm extends React.Component<{}> {
  @observable private displayName: string;
  @observable private displayNameError: string;

  public render() {
    return (
      <SettingsPane>
        <header>
          <span>Organizations for user:&nbsp;</span>
          <b>{session.account.accountName}</b>
        </header>
        <SettingsPaneContent>
          <Form>
            <FormLabel>Organization Name</FormLabel>
            <TextInput
                value={this.displayName}
                onChange={this.onChangeDisplayName}
                maxLength={64}
                autoFocus={true}
                validationStatus={this.displayNameError ? 'error' : null}
                validationMsg={this.displayNameError}
            />
          </Form>
          <section className="org-list">
            Orgs
          </section>
        </SettingsPaneContent>
      </SettingsPane>
    );
  }

  @action.bound
  private onChangeDisplayName(e: any) {
    this.displayName = e.target.value;
  }
}
