import * as React from 'react';
import { styled } from '../style';
import { Switch, Route } from 'react-router-dom';
import { SignInLink } from './SignInLink';
import { UserMenuButton } from './UserMenuButton';
import { NewIssueButton } from './NewIssueButton';

const HeaderLayout = styled.header`
  align-items: center;
  background-color: ${props => props.theme.headerBgColor};
  color: ${props => props.theme.headerTitleColor};
  display: flex;
  grid-area: header;
  padding: 5px 5px 5px 8px;

  > button {
    margin-right: 4px;
  }
`;

const HeaderTitle = styled.span`
  font-family: 'Russo One';
  font-size: 1.5rem;
  margin-right: .4rem;
`;

const HeaderSubTitle = styled.span`
  color: ${props => props.theme.headerSubTitleColor};
  flex: 1;
`;

export function Header() {
  return (
    <HeaderLayout>
      <HeaderTitle className="title">Klendathu</HeaderTitle>
      <HeaderSubTitle className="subtitle">
        <span> - </span>
        &ldquo;in order to <em>fight</em> the bug, we must <em>understand</em> the bug.&rdquo;
      </HeaderSubTitle>
      <Route path="/" render={props => <NewIssueButton />} />
      <Switch>
        <Route path="/account" />
        <Route path="/" component={UserMenuButton} />
      </Switch>
      <Switch>
        <Route path="/account" />
        <Route path="/settings" />
        <Route path="/" component={SignInLink} />
      </Switch>
    </HeaderLayout>
  );
}
