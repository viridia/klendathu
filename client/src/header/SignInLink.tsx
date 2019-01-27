import * as React from 'react';
import { NavButton } from '../controls';

export class SignInLink extends React.Component<{}> {
  public render() {
    return <NavButton to="/account/login" kind="action">Sign In</NavButton>;
  }
}
