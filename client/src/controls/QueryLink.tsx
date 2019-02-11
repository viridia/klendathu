import * as React from 'react';
import * as qs from 'qs';
import classNames from 'classnames';
import { Link, Route } from 'react-router-dom';

/** Link which renders in active state when all query parameters match. */
export function QueryLink({ to, query = {}, className, children }: {
  to: string,
  query?: { [key: string]: any },
  className?: string,
  children: React.ReactNode,
}) {
  return (
    <Route
        path={to}
        children={({ match, history, location }) => {
          let active = !!match;
          if (match) {
            const q = qs.parse(location.search.slice(1));
            for (const key of Object.getOwnPropertyNames(query)) {
              if (q[key] !== query[key]) {
                active = false;
                break;
              }
            }
          }
          const search = qs.stringify(query);
          return (
            <Link
              className={classNames(className, { active })}
              to={{ pathname: to, search: search ? `?${search}` : '' }}
            >
              {children}
            </Link>
          );
        }}
    />);
}
