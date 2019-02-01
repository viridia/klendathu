import * as React from 'react';
import * as qs from 'qs';
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

interface QueryParams { [name: string]: string | string[]; }

/** Wrapper that turns a button or menu into a react-router NavLink. */
export class NavContainer extends React.Component<NavContainerProps> {
  public render() {
    const { activeClassName = 'active', children, to, exact, ...props } = this.props;
    const child = React.Children.only(children);
    const path = typeof to === 'string' ? to : to.pathname;
    const query: QueryParams =
        typeof to === 'string' ? {} : qs.parse(to.search, { ignoreQueryPrefix: true });
    return (
      <Route
          path={path}
          exact={exact}
          children={({ match, history }) => React.cloneElement(
            child,
            {
              ...props,
              className: classNames(child.props.className, { [activeClassName]: match }),
              onClick: this.onClick.bind(this, history),
            }
          )}
      />
    );
  }

  private onClick(history: History<any>, e: any) {
    const { children, replace, to } = this.props;
    const child = React.Children.only(children);
    if (child.props.onClick) {
      child.props.onClick(e);
    }

    if (!e.defaultPrevented) {
      e.preventDefault();
      (replace ? history.replace : history.push)(to as any);
    }
  }
}
