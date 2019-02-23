import * as React from 'react';
import * as qs from 'qs';
import { RouteComponentProps } from 'react-router';
import { ViewContext } from '../models';
import { IssueList } from './IssueList';
import { FilterParams } from '../filters/FilterParams';
import { MassEdit } from '../massedit/MassEdit';

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
  // milestones: MilestoneListQuery;
}

/** Contains the table of issues for a project.
    Handles the mechanics of selection, filtering and column layout. Actual rendering is delegated
    to a sub-component.
 */
export function IssueListView(props: Props) {
  const { env } = props;
  React.useEffect(() => {
    env.issues.setQueryArgs(
      env.project,
      qs.parse(location.search, { ignoreQueryPrefix: true }));
  });
  return (
    <React.Fragment>
      <FilterParams {...props} env={env} />
      <MassEdit {...props} env={env} />
      <IssueList {...props} />
    </React.Fragment>
  );
}
