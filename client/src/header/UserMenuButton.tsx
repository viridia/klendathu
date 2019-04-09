import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { session } from '../models';
import { observer} from 'mobx-react';
import { NavContainer } from '../controls';
import { DropdownButton, MenuItem, MenuDivider } from 'skyhook-ui';
import bind from 'bind-decorator';

@observer
export class UserMenuButton extends React.Component<RouteComponentProps<{}>> {
  public render() {
    if (!session.account || !session.account.accountName) {
      return null;
    }
    const name = session.account && (session.account.display || session.account.accountName);
    return (
      <DropdownButton
        variant="action"
        title={name}
        id="user-menu"
        alignEnd={true}
      >
        <NavContainer to={{ pathname: '/' }} exact={true}>
          <MenuItem disabled={!name}>Projects</MenuItem>
        </NavContainer>
        <NavContainer to={{ pathname: '/settings/account' }}>
          <MenuItem disabled={!name}>Settings</MenuItem>
        </NavContainer>
        <MenuDivider />
        <MenuItem onClick={this.onSignOut}>Sign out</MenuItem>
      </DropdownButton>
    );
  }

  @bind
  private onSignOut(e: React.MouseEvent<{}>): void {
    e.preventDefault();
    session.logout();
    this.props.history.push({ pathname: '/account/login' });
  }
}
