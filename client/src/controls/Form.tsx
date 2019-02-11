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
  containerClassName?: string;
  validationMsg?: string;
  validationStatus?: ValidationState;
}

const TextInputImpl = React.forwardRef((
  {
    children,
    className,
    containerClassName,
    validationStatus,
    validationMsg,
    ...attrs
  }: InputProps & React.InputHTMLAttributes<HTMLInputElement>,
  ref: any) => (
  <InputContainer className={containerClassName}>
    <input
        ref={ref}
        className={classNames(className, validationStatus)}
        {...attrs}
    >
      {children}
    </input>
    {validationStatus &&
      <ValidationMsg className={classNames(validationStatus)}>
        {validationMsg}
      </ValidationMsg>}
  </InputContainer>
));

/** Text input form control. */
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

const TextAreaImpl = ({
    children,
    className,
    containerClassName,
    validationStatus,
    validationMsg,
    ...attrs
  }: InputProps
    & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <InputContainer className={containerClassName}>
      <textarea className={classNames(className, validationStatus)} {...attrs}>
        {children}
      </textarea>
      {validationStatus &&
        <ValidationMsg className={classNames(validationStatus)}>
          {validationMsg}
        </ValidationMsg>}
    </InputContainer>
  );
};

/** Textarea input form control. */
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

type FormLayout = 'stacked' | 'inline' | 'ledger' | 'row';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout;
}

function FormImpl({ children, className, layout = 'ledger', ...attrs }: FormProps) {
  return (
    <form className={classNames(className, `layout-${layout}`)} {...attrs}>
      {children}
    </form>
  );
}

export const Form = styled(FormImpl)`
  &.layout-ledger {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: [labels] auto [controls] 1fr;
    gap: 8px;
    align-items: flex-start;
    justify-items: flex-start;
  }

  &.layout-stacked {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &.layout-inline {
    display: flex;
    flex-direction: row;
    flex-flow: wrap;
    align-items: center;
  }

  &.layout-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
`;

export const FormLabel = styled.span`
  font-weight: bold;
  grid-column: labels;
  justify-self: end;
  white-space: nowrap;

  .layout-ledger & {
    margin-top: 6px;
  }

  .layout-stacked & {
    margin-top: 8px;
    margin-bottom: 6px;
    &:first-child {
      margin-top: 0;
    }
  }

  .layout-inline & {
    margin: 0 8px;
    &:first-child {
      margin-left: 0;
    }
  }
`;

export const FormControlGroup = styled.span`
  grid-column: controls;
`;
