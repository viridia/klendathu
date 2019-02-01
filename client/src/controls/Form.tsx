import * as React from 'react';
import classNames from 'classnames';
import { styled, ThemeProps } from '../style';

export const ValidationMsg = styled.div`
  font-size: 90%;
  margin-top: 4px;

  &.error {
    color: #c00;
  }

  &.warning {
    color: #990;
  }

  &.success {
    color: #090;
  }
`;

const InputContainer = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
`;

export type ValidationState = 'error' | 'warning' | 'success';

interface InputProps {
  validationMsg?: string;
  validationStatus?: ValidationState;
}

function TextInputImpl({
    children,
    className,
    validationStatus,
    validationMsg,
    ...attrs
  }: InputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <InputContainer>
      <input className={classNames(className, validationStatus)} {...attrs}>{children}</input>
      {validationStatus &&
        <ValidationMsg className={classNames(validationStatus)}>
          {validationMsg}
        </ValidationMsg>}
    </InputContainer>
  );
}

export const TextInput = styled(TextInputImpl)`
  background-color: ${(props: ThemeProps) => props.theme.inputBgColor};
  border: 1px solid ${(props: ThemeProps) => props.theme.inputBorderColor};
  border-radius: 3px;
  padding: 6px;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 3px ${(props: ThemeProps) => props.theme.focusColor};
    z-index: 1;
  }

  &.success {
    box-shadow: inset 0 0 0 2px #00cc0044;
  }

  &.warning {
    box-shadow: inset 0 0 0 2px #cccc0066;
  }

  &.error {
    box-shadow: inset 0 0 0 2px #ee000033;
  }
`;

function TextAreaImpl({
    children,
    className,
    validationStatus,
    validationMsg,
    ...attrs
  }: InputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <InputContainer>
      <textarea className={classNames(className, validationStatus)} {...attrs}>
        {children}
      </textarea>
      {validationStatus &&
        <ValidationMsg className={classNames(validationStatus)}>
          {validationMsg}
        </ValidationMsg>}
    </InputContainer>
  );
}

export const TextArea = styled(TextAreaImpl)`
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

  &.success {
    box-shadow: inset 0 0 0 2px #00cc0044;
  }

  &.warning {
    box-shadow: inset 0 0 0 2px #cccc0066;
  }

  &.error {
    box-shadow: inset 0 0 0 2px #ee000033;
  }
`;

type FormLayout = 'stacked' | 'inline' | 'ledger';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
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
  font-weight: bold;
  grid-column: labels;
  justify-self: end;
  white-space: nowrap;

  form.ledger & {
    margin-top: 6px;
  }

  form.stacked & {
    margin-top: 8px;
    margin-bottom: 6px;
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
