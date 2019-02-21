import * as React from 'react';
import {
  Dropdown as OverlayDropdown,
  DropdownMenu as OverlayDropdownMenu,
} from 'react-overlays';
import { Button, ButtonStyle, ButtonSize } from './Button';
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
  size?: ButtonSize;
  id?: string;
  kind?: ButtonStyle;
  className?: string;
  children: React.ReactNode;
  title: React.ReactNode;
  onSelect?: (key: string) => any;
}

const DropdownButtonEl = styled(Button)`
  justify-content: space-between;
  .down-arrow {
    margin-left: 1rem;
  }
`;

@observer
export class DropdownButton extends React.Component<DropdownButtonProps> {
  @observable private show = false;

  public render() {
    const {
      drop = 'down',
      size,
      alignEnd = false,
      className,
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
                <DropdownButtonEl
                    kind={kind}
                    size={size}
                    className={className}
                    {...buttonProps as any}
                    onClick={(e: any) => { e.preventDefault(); toggle(e); }}
                >
                  <span className="title">{title}</span>
                  <span className="down-arrow">&#9662;</span>
                </DropdownButtonEl>
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
  private onMenuClick(e: any) {
    const { onSelect } = this.props;
    this.show = false;
    // TODO: Perhaps this logic should go in the Menu component.
    if (onSelect) {
      let target: HTMLElement = e.target;
      while (target) {
        const role = target.getAttribute('role');
        if (role === 'menuitem') {
          if ('eventKey' in target.dataset) {
            e.preventDefault();
            onSelect(target.dataset.eventKey);
          }
          break;
        }
        target = target.parentElement;
      }
    }
  }
}
