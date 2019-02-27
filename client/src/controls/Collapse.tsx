import * as React from 'react';
import { styled } from '../style';
import { CSSTransition } from 'react-transition-group';

const CollapseStyle = styled.section`
  overflow: hidden;
  transition: max-height 0.4s ease;

  &.expand-enter-done {
    overflow: visible;
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
    <CSSTransition in={expanded} classNames="expand" timeout={300}>
      <CollapseStyle ref={ref} className={className}>
        {children}
      </CollapseStyle>
    </CSSTransition>
  );
}
