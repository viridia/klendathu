import * as React from 'react';
import classNames from 'classnames';
import { styled, ThemeProps } from '../style';
import { darken } from 'polished';

export type ButtonStyle = 'action' | 'primary' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  align-items: center;
  border: ${(props: ThemeProps) => props.theme.buttonColors.default.border
      ? `1px solid ${props.theme.buttonColors.default.border}` : 'none'};
  border-radius: 4px;
  background-color: ${(props: ThemeProps) => props.theme.buttonColors.default.bg};
  color: ${(props: ThemeProps) => props.theme.buttonColors.default.text};
  display: inline-flex;
  padding: 0 12px;
  height: 32px;
  outline: none;

  &[disabled] {
    opacity: 0.7;
  }

  &:focus {
    box-shadow: 0 0 0 3px ${(props: ThemeProps) => props.theme.focusColor};
    z-index: 1;
  }

  &:hover:not([disabled]) {
    background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonColors.default.bg)};
  }

  &:active:not([disabled]) {
    background-color: ${(props: ThemeProps) => darken(0.15, props.theme.buttonColors.default.bg)};
  }

  &.action {
    border: none;
    background-color: ${(props: ThemeProps) => props.theme.buttonColors.action.bg};
    color: ${(props: ThemeProps) => props.theme.buttonColors.action.text};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonColors.action.text}; }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonColors.action.bg)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.2, props.theme.buttonColors.action.bg)};
    }
  }

  &.primary {
    border: none;
    background-color: ${(props: ThemeProps) => props.theme.buttonColors.primary.bg};
    color: ${(props: ThemeProps) => props.theme.buttonColors.primary.text};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonColors.primary.text}; }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonColors.primary.bg)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.2, props.theme.buttonColors.primary.bg)};
    }
  }

  &.secondary {
    border: none;
    background-color: ${(props: ThemeProps) => props.theme.buttonColors.secondary.bg};
    color: ${(props: ThemeProps) => props.theme.buttonColors.secondary.text};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonColors.secondary.text}; }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) =>
          darken(0.05, props.theme.buttonColors.secondary.bg)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) =>
          darken(0.1, props.theme.buttonColors.secondary.bg)};
    }
  }

  &.small {
    height: 24px;
    font-size: 90%;
  }

  > svg {
    margin-right: 4px;
    margin-left: -5px;
    fill: ${(props: ThemeProps) => props.theme.buttonColors.default.text};
  }
`;
