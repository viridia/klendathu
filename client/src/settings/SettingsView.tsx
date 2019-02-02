import * as React from 'react';
import { styled } from '../style';
import { TabBar, Tab } from '../controls';
import { Switch, Route } from 'react-router';
import { UserAccountForm } from './UserAccountForm';
import { session } from '../models';
import { OrganizationForm } from './OrganizationForm';

const SettingsViewLayout = styled.section`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;

  > header {
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: .7rem;
  }
`;

export function SettingsView() {
  if (!session.account) {
    return null;
  }
  return (
    <SettingsViewLayout>
      <header>Settings</header>
      <TabBar>
        <Tab to="/settings/account">Account</Tab>
        <Tab to="/settings/organization">Organization</Tab>
      </TabBar>
      <Switch>
        <Route path="/settings/account">
          <UserAccountForm />
        </Route>
        <Route path="/settings/organization">
          <OrganizationForm />
        </Route>
      </Switch>
    </SettingsViewLayout>
  );
}
