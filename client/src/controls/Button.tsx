import * as React from 'react';
import classNames from 'classnames';
import { styled } from '../style';
import { darken, saturate } from 'polished';

export type ButtonStyle = 'action' | 'primary' | 'secondary' | 'default';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  small?: boolean;
  kind?: ButtonStyle;
  type?: string;
}

// This needs to be a class so it can accept refs.
class ButtonImpl extends React.Component<ButtonProps> {
  public render() {
    const { children, className, kind, small, ...attrs } = this.props;
    return (
      <button className={classNames(className, kind, { small })} {...attrs}>
        {children}
      </button>
    );
  }
}

/** A standard button. */
export const Button = styled(ButtonImpl)`
  align-items: center;
  border: ${props => props.theme.buttonColors[props.kind].border
      ? `1px solid ${props.theme.buttonColors[props.kind].border}` : 'none'};
  border-radius: 4px;
  background-color: ${props => props.theme.buttonColors[props.kind].bg};
  color: ${props => props.theme.buttonColors[props.kind].text};
  display: inline-flex;
  font-size: 1rem;
  padding: 0 12px;
  height: 32px;
  outline: none;

  &[disabled] {
    opacity: 0.7;
  }

  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.focusColor};
    z-index: 1;
  }

  &:hover:not([disabled]) {
    background-color: ${props => darken(0.05, props.theme.buttonColors[props.kind].bg)};
  }

  &:active:not([disabled]), &.active:not([disabled]) {
    background-color: ${props =>
        saturate(0.1, darken(0.15, props.theme.buttonColors[props.kind].bg))};
  }

  &.small {
    height: 24px;
    font-size: 90%;
  }

  > svg {
    margin-right: 4px;
    margin-left: -5px;
    fill: ${props => props.theme.buttonColors[props.kind].text};
  }
`;

Button.defaultProps = { kind: 'default' };
