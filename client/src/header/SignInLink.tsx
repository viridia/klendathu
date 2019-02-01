import * as React from 'react';
import { NavButton } from '../controls';
import { session } from '../models';

export class SignInLink extends React.Component<{}> {
  public render() {
    if (!session.isLoggedIn) {
      return <NavButton to="/account/login" kind="action">Sign In</NavButton>;
    }
    return null;
  }
}
