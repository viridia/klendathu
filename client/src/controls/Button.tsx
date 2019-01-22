import * as React from 'react';
import classNames from 'classnames';
import { styled, ThemeProps } from '../style';
import { transparentize, darken } from 'polished';

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
  align-items: center;
  border: ${(props: ThemeProps) => props.theme.buttonDefaultBorderColor
      ? `1px solid ${props.theme.buttonDefaultBorderColor}` : 'none'};
  border-radius: 4px;
  background-color: ${(props: ThemeProps) => props.theme.buttonDefaultBgColor};
  color: ${(props: ThemeProps) => props.theme.buttonDefaultTextColor};
  display: inline-flex;
  padding: 0 12px;
  height: 32px;
  outline: none;

  &[disabled] {
    opacity: 0.7;
  }

  &:focus {
    box-shadow: 0 0 0 3px
      ${(props: ThemeProps) => transparentize(0.7, props.theme.primaryColor)};
    z-index: 1;
  }

  &:hover:not([disabled]) {
    background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonDefaultBgColor)};
  }

  &:active:not([disabled]) {
    background-color: ${(props: ThemeProps) => darken(0.15, props.theme.buttonDefaultBgColor)};
  }

  &.action {
    border: none;
    background-color: ${(props: ThemeProps) => props.theme.buttonActionBgColor};
    color: ${(props: ThemeProps) => props.theme.buttonActionTextColor};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonActionTextColor}; }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonActionBgColor)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.2, props.theme.buttonActionBgColor)};
    }
  }

  &.primary {
    border: none;
    background-color: ${(props: ThemeProps) => props.theme.buttonPrimaryBgColor};
    color: ${(props: ThemeProps) => props.theme.buttonPrimaryTextColor};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonPrimaryTextColor}; }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonPrimaryBgColor)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.2, props.theme.buttonPrimaryBgColor)};
    }
  }

  &.secondary {
    border: none;
    background-color: ${(props: ThemeProps) => props.theme.buttonSecondaryBgColor};
    color: ${(props: ThemeProps) => props.theme.buttonSecondaryTextColor};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonSecondaryTextColor}; }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonSecondaryBgColor)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.1, props.theme.buttonSecondaryBgColor)};
    }
  }

  &.small {
    height: 24px;
    font-size: 90%;
  }

  > svg {
    margin-right: 4px;
    margin-left: -5px;
    fill: ${(props: ThemeProps) => props.theme.buttonDefaultTextColor};
  }
`;
