import * as React from 'react';
import classNames from 'classnames';
import { styled } from '../style';
import { darken } from 'polished';

export type ActionLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

function ActionLinkImpl({ children, className, ...attrs }: ActionLinkProps) {
  return (
    <a className={classNames(className)} {...attrs}>
      {children}
    </a>
  );
}

/** Looks like a link, but takes an action. */
export const ActionLink = styled(ActionLinkImpl)`
  color: ${props => props.theme.primaryColor};
  cursor: pointer;
  display: inline;
  outline: none;
  text-decoration: underline;

  &[disabled] {
    opacity: 0.7;
    pointer-events: none;
  }

  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.focusColor};
    z-index: 1;
  }

  &:hover:not([disabled]) {
    color: ${props => darken(0.05, props.theme.primaryColor)};
  }
`;
