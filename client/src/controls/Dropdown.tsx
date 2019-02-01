import * as React from 'react';
import {
  Dropdown as OverlayDropdown,
  DropdownMenu as OverlayDropdownMenu,
} from 'react-overlays';
import { Button, ButtonStyle } from './Button';
import { styled } from '../style';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { Menu } from './Menu';

export interface DropdownProps {
  show: boolean;
  alignEnd: boolean;
  drop: 'up' | 'left' | 'right' | 'down';
  children: React.ReactNode;
  onToggle: (isOpen: boolean, ev: React.SyntheticEvent) => void;
}

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const Dropdown = ({
    show = false,
    onToggle,
    drop = 'down',
    alignEnd = false,
    children,
  }: DropdownProps) => (
  <OverlayDropdown
    show={show}
    onToggle={onToggle}
    drop={drop}
    alignEnd={alignEnd}
    itemSelector="li:not(:disabled)"
  >
    {({ props }) => <DropdownContainer {...props}>{children}</DropdownContainer>}
  </OverlayDropdown>
);

interface DropdownMenuProps {
  children: (p: OverlayDropdownMenu.DropdownMenuRenderProps) => React.ReactElement<any>;
}

Dropdown.Menu = ({ children }: DropdownMenuProps) => (
  <OverlayDropdown.Menu flip={true}>{children}</OverlayDropdown.Menu>
);

// interface DropdownToggleProps {
//   id: string;
//   children: React.ReactNode;
// }

// Dropdown.Toggle = ({ id, children }: DropdownToggleProps) => (
//   <OverlayDropdown.Toggle>
//     {({ toggle, show, props }) => (
//       <Button id={id} {...props} onClick={toggle}>
//         {children}
//       </Button>
//     )}
//   </OverlayDropdown.Toggle>
// );

export interface DropDownProps {
  toggle: React.ReactNode;
  children: React.ReactNode;
}

export interface DropdownButtonProps {
  alignEnd?: boolean;
  drop?: 'up' | 'left' | 'right' | 'down';
  id?: string;
  kind?: ButtonStyle;
  children: React.ReactNode;
  title: React.ReactNode;
}

@observer
export class DropdownButton extends React.Component<DropdownButtonProps> {
  @observable private show = false;

  public render() {
    const {
      drop = 'down',
      alignEnd = false,
      children,
      title,
      kind,
    } = this.props;
    return (
      <OverlayDropdown
        show={this.show}
        onToggle={this.onToggle}
        drop={drop}
        alignEnd={alignEnd}
        itemSelector="button:not(:disabled)"
      >
        {({ props }) => (
          <DropdownContainer {...props}>
            <OverlayDropdown.Toggle>
              {({ toggle, show, props: buttonProps }) => (
                <Button kind={kind} {...buttonProps as any} onClick={toggle}>
                  {title}&nbsp;&#9662;
                </Button>
              )}
            </OverlayDropdown.Toggle>
            <OverlayDropdown.Menu flip={true}>
              {({ show, props: menuProps }) => {
                return show && (
                  <Menu
                    {...menuProps}
                    onClick={this.onMenuClick}
                  >
                    {children}
                  </Menu>
                );
              }}
            </OverlayDropdown.Menu>
          </DropdownContainer>
        )}
      </OverlayDropdown>
    );
  }

  @action.bound
  private onToggle(show: boolean) {
    this.show = show;
  }

  @action.bound
  private onMenuClick() {
    this.show = false;
  }
}
