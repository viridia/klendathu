import * as React from 'react';
import { styled } from '../style';
import classNames from 'classnames';

import DiscloseIcon from '../svg-compiled/icons/IcPlayArrow';

const DiscloseButtonEl = styled.button`
  margin-bottom: 0;
  margin-right: 4px;
  border: none;
  background: none;
  padding: 0;
  outline: none;
  transition: transform 0.5s ease;
  cursor: pointer;

  &.checked {
    transform: rotate(90deg);
  }

  > .svg-icon {
    > svg {
      width: 20px;
      height: 20px;
    }
  }
`;

interface Props {
  onClick: (state: any) => void;
  checked?: boolean;
}

export function DiscloseButton(props: Props) {
  return (
    <DiscloseButtonEl
        className={classNames('disclose', { checked: props.checked })}
        onClick={props.onClick}
    >
      <DiscloseIcon className="svg-icon" />
    </DiscloseButtonEl>
  );
}
