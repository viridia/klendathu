import { NavLink } from 'react-router-dom';
import { styled } from '../style';

export const Tab = styled(NavLink).attrs({
  activeClassName: 'selected',
})`
  align-items: flex-end;
  display: flex;
  background-color: ${props => props.theme.tabBgColor};
  border-bottom: 3px solid ${props => props.theme.tabBorderColor};
  border-radius: 6px 6px 0 0;
  color: ${props => props.theme.tabTextColor};
  font-weight: bold;
  margin: 0 12px 8px 0;
  padding: 8px 24px 4px 24px;
  text-decoration: none;
  text-align: center;

  &.selected {
    background-color: ${props => props.theme.tabActiveBgColor};
    border-bottom: 3px solid ${props => props.theme.tabActiveBorderColor};
    color: ${props => props.theme.tabActiveTextColor};
  }
`;

export const TabBar = styled.nav`
  display: flex;
  flex-direction: row;
`;
