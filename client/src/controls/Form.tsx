import * as React from 'react';
import classNames from 'classnames';
import { styled, ThemeProps } from '../style';

export const TextInput = styled.input`
  background-color: ${(props: ThemeProps) => props.theme.inputBgColor};
  border: 1px solid ${(props: ThemeProps) => props.theme.inputBorderColor};
  border-radius: 3px;
  padding: 6px;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 3px ${(props: ThemeProps) => props.theme.focusColor};
    z-index: 1;
  }
`;

export const TextArea = styled.textarea`
  background-color: ${(props: ThemeProps) => props.theme.inputBgColor};
  border: 1px solid ${(props: ThemeProps) => props.theme.inputBorderColor};
  border-radius: 3px;
  outline: none;
  padding: 6px;
  resize: none;

  &:focus {
    box-shadow: 0 0 0 3px ${(props: ThemeProps) => props.theme.focusColor};
    z-index: 1;
  }
`;

type FormLayout = 'stacked' | 'inline' | 'ledger';

export interface FormProps extends React.ButtonHTMLAttributes<HTMLFormElement> {
  children?: React.ReactNode;
  className?: string;
  layout?: FormLayout;
}

function FormImpl({ children, className, layout = 'ledger', ...attrs }: FormProps) {
  return (
    <form className={classNames(className, layout)} {...attrs}>
      {children}
    </form>
  );
}

export const Form = styled(FormImpl)`
  &.ledger {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: [labels] auto [controls] 1fr;
    gap: 8px;
    align-items: flex-start;
    justify-items: flex-start;
  }

  &.stacked {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &.inline {
    display: flex;
    flex-direction: row;
    flex-flow: wrap;
    align-items: center;
  }
`;

export const FormLabel = styled.span`
  grid-column: labels;
  justify-self: end;
  white-space: nowrap;

  form.ledger & {
    margin-top: 6px;
  }

  form.stacked & {
    margin-top: 8px;
    margin-bottom: 2px;
    &:first-child {
      margin-top: 0;
    }
  }

  form.inline & {
    margin: 0 8px;
    &:first-child {
      margin-left: 0;
    }
  }
`;

export const FormControlGroup = styled.span`
  grid-column: controls;
`;
