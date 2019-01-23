import * as React from 'react';
import classNames from 'classnames';
import { styled } from '../style';
import { readableColor, transparentize } from 'polished';

interface Props {
  children: React.ReactNode;
  className?: string;
  color?: string;
  small?: boolean;
  onClose?: () => void;
}

function ChipImpl({ children, className, onClose }: Props) {
  return (
    <span className={classNames('chip', className)}>
      {onClose && <button className="close" onClick={onClose}>&#x2715;</button>}
      <span className="title">{children}</span>
    </span>
  );
}

export const Chip = styled(ChipImpl).attrs(props => ({
  titleColor: readableColor(props.color),
  hoverColor: transparentize(0.4, readableColor(props.color)),
  height: props.small ? '20px' : '24px',
  borderRadius: props.small ? '10px' : '12px',
  fontSize: props.small ? '75%' : '85%',
}))`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.color};
  border-radius: ${props => props.borderRadius};
  color: ${props => props.titleColor};
  font-size: ${props => props.fontSize};
  flex-direction: row;
  height: ${props => props.height};
  overflow: hidden;
  margin-right: 3px;
  padding: 0 5px;
  user-select: none;

  .title {
    margin-right: 4px;
    margin-left: 4px;
  }

  > .close {
    align-items: center;
    border: none;
    color: ${props => props.hoverColor};
    cursor: pointer;
    background-color: transparent;
    display: flex;
    height: 16px;
    justify-content: center;
    margin-right: -4px;
    margin-top: 1px;
    outline: none;
    padding: 0;
    width: 16px;
    font-weight: bold;

    &:hover {
      color: ${props => props.titleColor};
    }
  }
`;

Chip.defaultProps = { color: 'gray' };
