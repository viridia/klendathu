import * as React from 'react';
import * as qs from 'qs';
import { RouteComponentProps } from 'react-router-dom';
import { ProjectEnv } from '../models';
import { IssueList } from './IssueList';
import { FilterParams } from '../filters/FilterParams';
import { MassEdit } from '../massedit/MassEdit';

type Props = RouteComponentProps<{}>;

/** Contains the table of issues for a project.
    Handles the mechanics of selection, filtering and column layout. Actual rendering is delegated
    to a sub-component.
 */
export function IssueListView(props: Props) {
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
      <FilterParams {...props} env={env} view="issues" search={location.search} />
      <MassEdit {...props} env={env} />
      <IssueList {...props} env={env} />
    </React.Fragment>
  );
}
