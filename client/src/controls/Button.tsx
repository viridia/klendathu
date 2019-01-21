import * as React from 'react';
import classNames from 'classnames';
import { styled, ThemeProps } from '../style';

export type ButtonStyle = 'action' | 'primary' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  small?: boolean;
  type?: ButtonStyle;
}

function ButtonImpl({ children, className, type, small, ...attrs }: ButtonProps) {
  return (
    <button className={classNames(className, type, { small })} {...attrs}>
      {children}
    </button>
  );
}

export const Button = styled(ButtonImpl)`
  border: none;
  border-radius: 4px;
  background-color: pink;
  display: inline-flex;
  padding: 0 12px;
  height: 32px;

  [disabled] {
    opacity: 0.5;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(128, 0, 0, 0.5);
  }

  &.action {
    background-color: ${(props: ThemeProps) => props.theme.primaryColor};
  }

  &.primary {
    background-color: blue;
  }

  &.secondary {
    background-color: gray;
  }

  &.small {
    height: 24px;
  }
`;
