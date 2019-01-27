import * as React from 'react';
import { styled } from '../style';
import { darken } from 'polished';

const NavLayout = styled.nav`
  background-color: ${props => props.theme.leftNavBgColor};
  border-right: 1px solid ${props => darken(0.1, props.theme.leftNavBgColor)};
  color: ${props => props.theme.leftNavTextColor};
  display: flex;
  flex-direction: column;
  grid-area: nav;
  padding: 16px 8px;
`;

export class LeftNav extends React.Component<{}> {
  public render() {
    return (
      <NavLayout>
        Nav
      </NavLayout>
    );
  }
}
