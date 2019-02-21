import * as React from 'react';
import { styled } from '../style';
import classNames from 'classnames';

const CollapseStyle = styled.section`
  border-top: 1px solid ${props => props.theme.cardHeaderDividerColor};
  overflow: hidden;
  transition: height 0.4s ease;

  &.expanded {
    overflow: visible;
    > * {
      transform: scaleY(1);
    }
  }

  > * {
    transform: scaleY(0);
    transform-origin: top left;
    transition: transform 0.4s ease;
  }
`;

interface Props {
  expanded?: boolean;
  className?: string;
  children: React.ReactNode;
}

export class Collapse extends React.Component<Props> {
  private ref = React.createRef<HTMLElement>();

  public render() {
    const { expanded, className, children } = this.props;
    const height = expanded && this.ref.current ? this.ref.current.scrollHeight : 0;
    return (
      <CollapseStyle
          ref={this.ref}
          className={classNames(className, { expanded })}
          style={{ height }}
      >
        {children}
      </CollapseStyle>
    );
  }
}
