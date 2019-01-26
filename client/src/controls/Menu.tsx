import * as React from 'react';
import { styled } from '../style';
import bind from 'bind-decorator';

export const Menu = styled.div`
  background-color: ${props => props.theme.menuBgColor};
  border: 1px solid ${props => props.theme.menuBorderColor};
  border-radius: 3px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  margin: 4px 0;
  min-width: 150px;
  position: absolute;
  padding: 4px;
`;

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSelect?: () => void;
}

export class MenuItemImpl extends React.Component<MenuItemProps> {
  public render() {
    const { onClick: onSelect, ...props } = this.props;
    return <button {...props} onClick={this.onClick} onKeyDown={this.onKeyDown} />;
  }

  @bind
  public onKeyDown(e: any) {
    if (e.keyCode === 13 || e.keyCode === 32) {
      if (this.props.onSelect) {
        this.props.onSelect();
      }
    }
  }

  @bind
  public onClick(e: any) {
    if (this.props.onSelect) {
      this.props.onSelect();
    }
  }
}

export const MenuItem = styled(MenuItemImpl).attrs((props: MenuItemProps) => ({
  tabIndex: -1,
}))`
  background-color: transparent;
  border: none;
  color: ${props => props.theme.menuTextColor};
  /* cursor: pointer; */
  display: flex;
  flex-direction: row;
  outline: none;
  padding: 4px;

  &:hover {
    background-color: ${props => props.theme.menuHoverBgColor};
    color: ${props => props.theme.menuHoverTextColor};
  }

  &:focus {
    background-color: ${props => props.theme.menuFocusBgColor};
    color: ${props => props.theme.menuFocusTextColor};
  }
`;
