import * as React from 'react';
import * as qs from 'qs';
import { RouteComponentProps } from 'react-router-dom';
import { ProjectEnv } from '../models';
import { ProgressGrid } from './ProgressGrid';
import { FilterParams } from '../filters/FilterParams';

/** Contains the table of issues for a project.
    Handles the mechanics of selection, filtering and column layout. Actual rendering is delegated
    to a sub-component.
 */
export function ProgressView(props: RouteComponentProps<{}>) {
  const env = React.useContext(ProjectEnv);
  const { location } = props;
  React.useEffect(() => {
    env.issues.setQueryArgs(
      env.project,
      env.states,
      qs.parse(location.search, { ignoreQueryPrefix: true }));
  }, [location]);
  return (
    <React.Fragment>
      <FilterParams {...props} env={env} view="progress" search={location.search} />
      <ProgressGrid {...props} env={env} />
    </React.Fragment>
  );
}
