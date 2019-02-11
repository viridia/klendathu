import * as React from 'react';
import classNames from 'classnames';
import { styled } from '../style';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: (el: HTMLInputElement) => void;
}

function CheckBoxImpl({ children, className, ...props }: Props) {
  const disabled = props.disabled;
  return (
    <label className={classNames(className, { disabled })}>
      <input type="checkbox" {...props} />
      <span className="caption">{children}</span>
    </label>
  );
}

export const CheckBox = styled(CheckBoxImpl)`
  align-items: center;
  cursor: pointer;
  display: inline-flex;

  > input {
    margin-right: 6px;
  }

  &.disabled {
    cursor: default;
    > .caption {
      opacity: 0.7;
    }
  }
`;

function RadioButtonImpl({ children, className, ...props }: Props) {
  const disabled = props.disabled;
  return (
    <label className={classNames(className, { disabled })}>
      <input type="radio" {...props} />
      <span className="caption">{children}</span>
    </label>
  );
}

export const RadioButton = styled(RadioButtonImpl)`
  align-items: center;
  cursor: pointer;
  display: inline-flex;

  > input {
    margin-right: 6px;
  }

  &.disabled {
    cursor: default;
    > .caption {
      opacity: 0.7;
    }
  }
`;
