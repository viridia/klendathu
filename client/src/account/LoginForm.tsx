import * as React from 'react';
// import { Errors } from '../../../common/types/json';
import { Card, Form, TextInput, FormLabel, LinkButton, Button, NavButton } from '../controls';
import { RouteComponentProps, NavLink } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { styled } from '../style';
// import { session } from '../../models';
// import { RequestError } from '../network/RequestError';

import googleImg from '../icons/google.png';
import githubImg from '../icons/github.png';
import twitterImg from '../icons/twitter.png';
import { darken, lighten } from 'polished';

const LoginCard = styled(Card)`
  display: flex;
  flex-direction: row;
  grid-area: content;
  padding: 12px 16px;
  align-items: stretch;
`;

const ButtonRow = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 12px;
  > * {
    margin-left: 8px;
  }
`;

const Divider = styled.div`
  background-color: ${props => props.theme.cardHeaderDividerColor};
  margin: 0 16px;
  width: 1px;
`;

const ProviderList = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProviderButton = styled(LinkButton)`
  color: white;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
  > .logo {
    height: 18px;
    margin-right: 8px;
  }
`;

const GoogleBgColor = '#dd4b39';
const GitHubBgColor = '#464646';
const TwitterBgColor = '#38A1F3';

const GoogleProviderButton = styled(ProviderButton)`
  background-color: ${GoogleBgColor};
  border-color: ${darken(0.1, GoogleBgColor)};
  &:active, &&:hover {
    background: ${lighten(0.05, GoogleBgColor)};
  }
`;

const GitHubProviderButton = styled(ProviderButton)`
  background-color: ${GitHubBgColor};
  border-color: ${darken(0.1, GitHubBgColor)};
  &:active, &&:hover {
    background: ${lighten(0.05, GitHubBgColor)};
  }
`;

const TwitterProviderButton = styled(ProviderButton)`
  background-color: ${TwitterBgColor};
  border-color: ${darken(0.1, TwitterBgColor)};
  &:active, &&:hover {
    background: ${lighten(0.05, TwitterBgColor)};
  }
`;

@observer
export class LoginForm extends React.Component<RouteComponentProps<{}>> {
  @observable private email: string = '';
  @observable private emailError: string = '';
  @observable private password: string = '';
  @observable private passwordError: string = '';
  @observable private visible = false;

  public componentWillMount() {
    // Make sure there's no stored token, so that social login doesn't get confused.
    // session.logout();
    this.visible = true;
  }

  public render() {
    if (!this.visible) {
      return null;
    }
    const { location } = this.props;
    // console.log('location', location);
    let nextUrl = '';
    if (location.state && location.state.next) {
      const loc = this.props.history.createHref(location.state.next);
      nextUrl = `?next=${encodeURIComponent(loc)}`;
    }
    const canSubmit = this.email.length > 1 && this.password.length > 1;
    return (
      <LoginCard>
        <Form layout="stacked" onSubmit={this.onSubmit}>
          <FormLabel>Email</FormLabel>
          <TextInput
              id="username"
              type="text"
              value={this.email}
              placeholder="Enter user name"
              autoComplete="email"
              onChange={this.onChangeUserName}
              validationStatus={this.emailError ? 'error' : null}
              validationMsg={this.emailError}
          />
          <FormLabel>Password</FormLabel>
          <TextInput
              id="password"
              type="password"
              value={this.password}
              autoComplete="password"
              placeholder="Enter password"
              onChange={this.onChangePassword}
              name="password"
              validationStatus={this.passwordError ? 'error' : null}
              validationMsg={this.passwordError}
          />
          <ButtonRow>
            <NavLink to={{ ...this.props.location, pathname: '/account/register' }}>
              Create Account
            </NavLink>
            <Button kind="action" type="submit" disabled={!canSubmit}>Sign In</Button>
          </ButtonRow>
        </Form>
        <Divider />
        <ProviderList>
          <GoogleProviderButton href={`/auth/google${nextUrl}`}>
            <img className="logo" src={googleImg} />
            Login with Google
          </GoogleProviderButton>
          <GitHubProviderButton href="/auth/github">
            <img className="logo" src={githubImg} />
            Login with Github
          </GitHubProviderButton>
          <TwitterProviderButton href="/auth/facebook" disabled={true}>
            <img className="logo" src={twitterImg} />
            Login with Twitter
          </TwitterProviderButton>
        </ProviderList>
      </LoginCard>
      //   <div className="username-login">
      //     <div className="button-row">
      //       <section>
      //         <LinkContainer to={{ ...this.props.location, pathname: '/account/register' }}>
      //           <Button bsStyle="link">Create Account</Button>
      //         </LinkContainer>
      //         <LinkContainer to={{ ...this.props.location, pathname: '/account/recover' }}>
      //           <Button bsStyle="link">Forgot Password?</Button>
      //         </LinkContainer>
      //       </section>
      //       <Button kind="primary" type="submit" disabled={!canSubmit}>Sign In</Button>
      //     </div>
      //   </div>
      // </Form>
    );
  }

  @action.bound
  private onChangeUserName(e: any) {
    this.email = e.target.value;
  }

  @action.bound
  private onChangePassword(e: any) {
    this.password = e.target.value;
  }

  @action.bound
  private onSubmit(e: any) {
    e.preventDefault();
    this.emailError = '';
    this.passwordError = '';
    // session.login(this.email, this.password).then(result => {
    //   this.props.history.replace('/');
    // }, (error: RequestError) => {
    //   switch (error.code) {
    //     case Errors.NOT_FOUND:
    //       this.emailError = 'Unknown email address.';
    //       break;
    //     case Errors.INCORRECT_PASSWORD:
    //       this.emailError = 'Incorrect password for this email address.';
    //       break;
    //     default:
    //       this.emailError = error.message || error.code;
    //       break;
    //   }
    // });
  }
}
