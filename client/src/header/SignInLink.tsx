import * as React from 'react';
import { NavContainer, Button } from '../controls';
import { session } from '../models';

export class SignInLink extends React.Component<{}> {
  public render() {
    if (!session.isLoggedIn) {
      return (
        <NavContainer to="/account/login">
          <Button kind="action">Sign In</Button>
        </NavContainer>
      );
    }
    return null;
  }
}
