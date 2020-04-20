import { styled } from '../style';

export const Panel = styled.div`
  background-color: ${props => props.theme.cardBgColor};
  border: 1px solid ${props => props.theme.cardBorderColor};
`;
