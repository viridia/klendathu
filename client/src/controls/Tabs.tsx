import { NavLink } from 'react-router-dom';
import { styled } from '../style';

export const Tab = styled(NavLink).attrs({
  activeClassName: 'selected',
})`
  background-color: ${props => props.theme.tabBgColor};
  border-bottom: 3px solid ${props => props.theme.tabBorderColor};
  color: ${props => props.theme.tabTextColor};
  font-weight: bold;
  margin: 0 12px 8px 0;
  padding: 8px 24px 4px 24px;
  text-decoration: none;
  border-radius: 6px 6px 0 0;

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
