import * as React from 'react';
import * as qs from 'qs';
import { RouteComponentProps } from 'react-router';
import { ViewContext } from '../models';
import { IssueList } from './IssueList';

interface Props extends RouteComponentProps<{}> {
  context: ViewContext;
  // milestones: MilestoneListQuery;
}

/** Contains the table of issues for a project.
    Handles the mechanics of selection, filtering and column layout. Actual rendering is delegated
    to a sub-component.
 */
export function IssueListView(props: Props) {
  const { context } = props;
  React.useEffect(() => {
    context.issues.setQueryArgs(
      context.project,
      qs.parse(location.search, { ignoreQueryPrefix: true }));
  });
  return <IssueList {...props} />;
}
