import * as React from 'react';
import { Button } from 'skyhook-ui';
import { NavContainer } from '../controls';
import { session } from '../models';

export class SignInLink extends React.Component<{}> {
  public render() {
    if (!session.isLoggedIn) {
      return (
        <NavContainer to="/account/login">
          <Button variant="action">Sign In</Button>
        </NavContainer>
      );
    }
    return null;
  }
}
