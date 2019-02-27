import * as React from 'react';
import { styled } from '../style';
import classNames from 'classnames';

const CollapseStyle = styled.section`
  overflow: hidden;
  transition: max-height 0.4s ease;

  &.expanded {
    overflow: visible;
    > * {
      opacity: 1;
    }
  }

  > * {
    opacity: 0;
    transition: opacity 0.4s ease;
  }
`;

interface Props {
  expanded?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Collapse({ expanded, className, children }: Props) {
  const ref = React.useRef<HTMLElement>(null);
  React.useLayoutEffect(() => {
    const height = expanded ? ref.current.scrollHeight + 4 : 0;
    ref.current.style.maxHeight = `${height}px`;
  });
  return (
    <CollapseStyle
        ref={ref}
        className={classNames(className, { expanded, collapsed: !expanded })}
    >
      {children}
    </CollapseStyle>
  );
}
