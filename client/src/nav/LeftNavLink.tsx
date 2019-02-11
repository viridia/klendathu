import { QueryLink } from '../controls';
import styled from 'styled-components';

export const LeftNavLink = styled(QueryLink)`
  display: flex;
  align-items: center;
  margin: 3px;
  text-decoration: none;
  color: ${props => props.theme.leftNavTextColor};

  &.active {
    font-weight: bold;
  }

  > svg {
    margin-right: 6px;
    width: 24px;
    height: 24px;
    fill: ${props => props.theme.leftNavTextColor};
  }
`;
