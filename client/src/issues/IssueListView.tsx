import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ProjectContext } from '../../../common/types/graphql';
import gql from 'graphql-tag';
import { ErrorDisplay } from '../graphql/ErrorDisplay';
import { Query } from 'react-apollo';

const IssueListQuery = gql`
  query IssueListQuery($query: IssueQueryParams!, $pagination: Pagination) {
    issues(query: $query, pagination: $pagination) {
      count
      offset
      issues {
        id type state summary description
      }
    }
  }
`;

interface Props extends RouteComponentProps<{}> {
  context: ProjectContext;
  // prefs: ObservableProjectPrefs;
  // milestones: MilestoneListQuery;
}

/** Contains the table of issues for a project.
    Handles the mechanics of selection, filtering and column layout. Actual rendering is delegated
    to a sub-component.
 */
export class IssueListView extends React.Component<Props> {
  public render() {
    const { project } = this.props.context;
    if (!project) {
      return null;
    }
    return (
      <Query
          query={IssueListQuery}
          variables={{
            query: {
              project: project.id,
            },
          }}
          fetchPolicy="cache-and-network"
      >
        {({ loading, error, data, refetch, subscribeToMore }) => {
          if (loading && !(data && data.projects)) {
            // Only display loading indicator if nothing in cache.
            return <div>loading&hellip;</div>;
          } else if (error) {
            return <ErrorDisplay error={error} />;
          } else {
            return (<div>{data.issues.count}</div>);
          }
        }}
      </Query>
    );
  }
}
