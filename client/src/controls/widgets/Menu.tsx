import React from 'react';
import classNames from 'classnames';
import {
  Menu as RMenu,
  MenuButton as RMenuButton,
  MenuPopover,
  MenuItems as RMenuItems,
  MenuItem as RMenuItem,
  MenuItemProps as RMenuItemProps,
  MenuLink as RMenuLink,
} from '@reach/menu-button';
import { positionMatchWidth, positionDefault } from '@reach/popover';
import { SizeVariant } from 'skyhook-ui';
import { ButtonVariant, Button } from './Button';
import { styled } from '../../style';

import '@reach/menu-button/styles.css';

export interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: SizeVariant;
  width?: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  noCaret?: boolean;
}

export const Menu = RMenu;

const StyledMenuButton = Button.withComponent(RMenuButton);

export const MenuButton = React.forwardRef(({ children, noCaret, width, ...props }: MenuButtonProps,
  ref: React.RefObject<HTMLButtonElement>
) => (
  <StyledMenuButton
    {...props}
    style={{ minWidth: width }}
    ref={ref}
  >
    {children}
    {!noCaret && <span className="spacer" />}
    {!noCaret && <span className="caret">&#x25BE;</span>}
  </StyledMenuButton>
));
MenuButton.displayName = 'MenuButton';
MenuButton.defaultProps = {
  variant: 'default',
  size: 'normal',
};

export const MenuItems = styled(RMenuItems)`
  background-color: ${p => p.theme.menu.bgColor};
  border: 1px solid ${p => p.theme.menu.borderColor};
  border-radius: 3px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  margin: 4px 0;
  padding: 4px 0;
  z-index: 20;

  [data-reach-menu-item] {
    font-family: ubuntu;
    font-size: 1rem;
    margin: 0 4px;
    padding: 5px 8px;
    display: flex;
    align-items: center;

    &[data-selected] {
      background-color: ${p => p.theme.menu.hoverBgColor};
      color: ${p => p.theme.menu.hoverTextColor};
    }

    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    &.checked {
      font-weight: bold;
      position: relative;

      /** Inject unicode checkmark symbol */
      &::before {
        position: absolute;
        content: '\\2713';
        left: 8px;
      }
    }
  }

  &.checkmarks [data-reach-menu-item] {
    padding-left: 30px;
  }
`;

interface MenuListProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'justify';
  checkmarks?: boolean;
  children: React.ReactNode;
}

export function MenuList({
  align,
  checkmarks,
  className,
  ...props
}: MenuListProps): JSX.Element {
  const position = align === 'justify' ? positionMatchWidth : positionDefault;
  return (
    <MenuPopover position={position}>
      <MenuItems {...props} className={classNames(className, { checkmarks })} />
    </MenuPopover>
  );
}

interface MenuItemProps extends RMenuItemProps, React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  disabled?: boolean;
  onSelect: () => any;
  children: React.ReactNode;
}

const onSelectDisabled = () => {}

export const MenuItem = ({ checked, disabled, className, onSelect, ...props }: MenuItemProps) => (
  <RMenuItem
    {...props}
    className={classNames(className, { checked, disabled })}
    onSelect={disabled ? onSelectDisabled : onSelect}
  />
);

export const MenuLink = RMenuLink;

export const MenuDivider = styled.hr`
  align-self: stretch;
  border-top: none;
  border-bottom: 1px solid ${p => p.theme.menu.dividerColor};
  display: block;
  margin: 4px 0;
`;
