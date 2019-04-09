import * as React from 'react';
import classNames from 'classnames';
import { Route } from 'react-router-dom';
import { History } from 'history';

export interface NavContainerProps {
  activeClassName?: string;
  children: React.ReactNode;
  disabled?: boolean;
  exact?: boolean;
  replace?: boolean;
  to: History.LocationDescriptor<any>;
}

interface ChildProps {
  className?: string;
  onClick: (e: any) => any;
}

/** Wrapper that turns a button or menu into a react-router NavLink. */
export class NavContainer extends React.Component<NavContainerProps> {
  public render() {
    const { activeClassName = 'active', children, to, exact, ...props } = this.props;
    const child = React.Children.only(children) as React.ReactElement<ChildProps>;
    const path = typeof to === 'string' ? to : to.pathname;
    return (
      <Route
        path={path}
        exact={exact}
      >
        {({ match, history }) => React.cloneElement(
          child,
          {
            ...props,
            className: classNames(child.props.className, { [activeClassName]: match }),
            onClick: this.onClick.bind(this, history),
          }
        )}
      </Route>
    );
  }

  private onClick(history: History<any>, e: any) {
    const { children, replace, to } = this.props;
    const child = React.Children.only(children) as React.ReactElement<any>;
    if (child.props.onClick) {
      child.props.onClick(e);
    }

    if (!e.defaultPrevented) {
      e.preventDefault();
      (replace ? history.replace : history.push)(to as any);
    }
  }
}
