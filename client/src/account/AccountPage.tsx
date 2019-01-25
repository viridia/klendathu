import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
// import { VerifyEmailForm } from './VerifyEmailForm';
import { ToastContainer } from 'react-toastify';
import { Page } from '../layout';
import styled from 'styled-components';

const AccountPageContent = styled.section`
  background-color: ${props => props.theme.pageBgColor};
  flex: 1;
  display: grid;
  grid-template-areas:
    ". . ."
    ". content ."
    ". . .";
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 1fr auto 3fr;
`;

/** Page structure used for login, register, most other logged-out operations */
export class AccountPage extends React.Component<RouteComponentProps<{}>> {
  public render() {
    return (
      <Page>
        <ToastContainer
            position="bottom-right"
            autoClose={10000}
            hideProgressBar={true}
            newestOnTop={false}
        />
        <AccountPageContent>
          <Switch>
            <Route path="/account/login" component={LoginForm} />
            <Route path="/account/register" component={RegisterForm} />
            {/* <Route path="/account/verify" component={VerifyEmailForm} /> */}
            <Route path="/account/recover" />
            <Route path="/account/reset" />
          </Switch>
        </AccountPageContent>
      </Page>
    );
  }
}
