import { styled } from '../style';

export const TimeLabel = styled.span`
  color: ${props => props.theme.textExtraMuted};
  font-weight: bold;
  grid-column: labels;
  justify-self: end;
  white-space: nowrap;
`;
