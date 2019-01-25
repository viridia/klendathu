import * as React from 'react';
import { styled } from '../style';
import { darken } from 'polished';
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';

function NavLinkImpl({ children, className, ...attrs }: NavLinkProps & { disabled?: boolean; }) {
  return (
    <RouterNavLink className={className} {...attrs}>
      {children}
    </RouterNavLink>
  );
}

/** Looks like a button, but is actually an anchor tag. */
export const NavLink = styled(NavLinkImpl)`
  color: ${props => props.theme.primaryColor};

  &[disabled] {
    color: ${props => props.theme.dilutedColor};
    opacity: 0.7;
    pointer-events: none;
  }

  &:hover:not([disabled]) {
    color: ${props => darken(0.2, props.theme.primaryColor)};
  }

  &:active:not([disabled]) {
    color: ${props => darken(0.3, props.theme.primaryColor)};
  }
`;
