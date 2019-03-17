import styled from 'styled-components';
import ReactDatePicker from 'react-datepicker';

export const DatePicker = styled(ReactDatePicker)`
  background-color: ${props => props.theme.inputBgColor};
  border: 1px solid ${props => props.theme.inputBorderColor};
  border-radius: 2px;
  padding: 6px;
  outline: none;
  &:focus-within {
    box-shadow: 0 0 0 3px ${props => props.theme.focusColor};
    z-index: 1;
  }
`;
