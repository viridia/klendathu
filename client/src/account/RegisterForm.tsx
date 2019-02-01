import * as React from 'react';
import bind from 'bind-decorator';
import { Errors } from '../../../common/types/json';
import { RouteComponentProps } from 'react-router-dom';
import { action, observable } from 'mobx';
import { createUserAccount } from '../network/requests';
import { RequestError } from '../network';
import { observer } from 'mobx-react';
import { styled } from '../style';
import { Card, Form, TextInput, FormLabel, Button, NavLink, NavContainer } from '../controls';

const RegisterCard = styled(Card)`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  grid-area: content;
  && > form {
    align-items: stretch;
  }
`;

const ButtonRow = styled.div`
  align-items: center;
  align-self: stretch;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  > * {
    margin-left: 8px;
    &:first-child {
      margin-left: 0;
      margin-right: 50px;
    }
  }
`;

const RegisterFormEl = styled(Form)`
  padding: 12px 16px;
`;

@observer
export class RegisterForm extends React.Component<RouteComponentProps<{}>> {
  @observable private email: string = '';
  @observable private emailError: string = '';
  @observable private password: string = '';
  @observable private passwordError: string = '';
  @observable private password2: string = '';
  @observable private password2Error: string = '';

  public render() {
    const { next } = this.props.location.state || { next: undefined };
    const canSubmit =
        this.email.length > 0 &&
        this.password.length > 0 &&
        this.password2.length > 0;
    return (
      <RegisterCard>
        <header>Create Account</header>
        <RegisterFormEl layout="stacked" className="signup-form card" onSubmit={this.onSubmit}>
            <FormLabel>Email</FormLabel>
            <TextInput
                id="email"
                type="text"
                value={this.email}
                placeholder="Enter email address"
                autoComplete="email"
                onChange={this.onChangeEmail}
                validationStatus={this.emailError ? 'error' : null}
                validationMsg={this.emailError}
            />
            <FormLabel>Password</FormLabel>
            <TextInput
                id="password"
                type="password"
                value={this.password}
                placeholder="Choose a password"
                autoComplete="new-password"
                onChange={this.onChangePassword}
                validationStatus={this.passwordError ? 'error' : null}
                validationMsg={this.passwordError}
            />
            <FormLabel>Confirm Password</FormLabel>
            <TextInput
                id="confirm-password"
                type="password"
                value={this.password2}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                onChange={this.onChangePassword2}
                validationStatus={this.password2Error ? 'error' : null}
                validationMsg={this.password2Error}
            />
          <ButtonRow>
            <NavLink to={{ ...this.props.location, pathname: '/account/login' }}>Sign In</NavLink>
            <NavContainer to={next || { pathname: '/' }}>
              <Button kind="secondary">Cancel</Button>
            </NavContainer>
            <Button kind="action" type="submit" disabled={!canSubmit}>
              Create Account
            </Button>
          </ButtonRow>
        </RegisterFormEl>
      </RegisterCard>
    );
  }

  @action.bound
  private onSubmit(ev: any) {
    ev.preventDefault();

    this.emailError = '';
    this.passwordError = '';
    this.password2Error = '';
    if (this.password !== this.password2) {
      this.password2Error = 'Password doesn\'t match.';
      return;
    }

    createUserAccount(this.email, this.password).then(account => {
      this.props.history.replace('/');
    }, (error: RequestError) => {
      switch (error.code) {
        case Errors.INVALID_EMAIL:
          this.emailError = 'Invalid email address.';
          break;

        case Errors.TEXT_TOO_SHORT:
          this.passwordError = 'The password should be at least 6 characters.';
          break;

        case Errors.EXISTS:
          this.passwordError = 'The email address is already in use by another account.';
          break;

        default:
          this.emailError = error.message || error.code;
          break;
      }
    });
  }

  @bind
  private onChangeEmail(e: any) {
    this.email = e.target.value;
  }

  @bind
  private onChangePassword(e: any) {
    this.password = e.target.value;
  }

  @bind
  private onChangePassword2(e: any) {
    this.password2 = e.target.value;
  }
}
