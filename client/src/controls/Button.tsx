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
  border: none;
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
      ${(props: ThemeProps) => transparentize(0.2, props.theme.buttonDefaultBgColor)};
  }

  &:hover:not([disabled]) {
    background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonDefaultBgColor)};
  }

  &:active:not([disabled]) {
    background-color: ${(props: ThemeProps) => darken(0.15, props.theme.buttonDefaultBgColor)};
  }

  &.action {
    background-color: ${(props: ThemeProps) => props.theme.buttonActionBgColor};
    color: ${(props: ThemeProps) => props.theme.buttonActionTextColor};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonActionTextColor}; }

    &:focus {
      box-shadow: 0 0 0 3px
        ${(props: ThemeProps) => transparentize(0.5, props.theme.buttonActionBgColor)};
    }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonActionBgColor)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.2, props.theme.buttonActionBgColor)};
    }
  }

  &.primary {
    background-color: ${(props: ThemeProps) => props.theme.buttonPrimaryBgColor};
    color: ${(props: ThemeProps) => props.theme.buttonPrimaryTextColor};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonPrimaryTextColor}; }

    &:focus {
      box-shadow: 0 0 0 3px
        ${(props: ThemeProps) => transparentize(0.3, props.theme.buttonPrimaryBgColor)};
    }

    &:hover:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.05, props.theme.buttonPrimaryBgColor)};
    }

    &:active:not([disabled]) {
      background-color: ${(props: ThemeProps) => darken(0.2, props.theme.buttonPrimaryBgColor)};
    }
  }

  &.secondary {
    background-color: ${(props: ThemeProps) => props.theme.buttonSecondaryBgColor};
    color: ${(props: ThemeProps) => props.theme.buttonSecondaryTextColor};
    > svg { fill: ${(props: ThemeProps) => props.theme.buttonSecondaryTextColor}; }

    &:focus {
      box-shadow: 0 0 0 3px
        ${(props: ThemeProps) => transparentize(0.1, props.theme.buttonSecondaryBgColor)};
    }

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
