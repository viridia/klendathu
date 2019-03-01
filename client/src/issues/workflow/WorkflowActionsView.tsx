import * as React from 'react';
import * as H from 'history';
import { Issue } from '../../../../common/types/graphql';
import gql from 'graphql-tag';
import { fragments, ErrorDisplay } from '../../graphql';
import { Query } from 'react-apollo';
import { ProjectEnv } from '../../models';
import { WorkflowActions } from './WorkflowActions';

const IssueTimelineQuery = gql`
  query IssueTimelineQuery($project: ID!, $issue: ID!) {
    timeline(project: $project, issue: $issue) {
      count offset results { ...TimelineEntryFields }
    }
  }
  ${fragments.timelineEntry}
`;

interface Props {
  issue: Issue;
  history: H.History;
}

export function WorkflowActionsView({ issue, history }: Props) {
  const env = React.useContext(ProjectEnv);
  return (
    <Query
        query={IssueTimelineQuery}
        variables={{
          issue: issue.id,
          project: issue.project,
        }}
    >
      {({ data, error, loading, subscribeToMore, refetch }) => {
        if (error) {
          return <ErrorDisplay error={error} />;
        }
        const { timeline } = data;
        return (
          <WorkflowActions
            history={history}
            env={env}
            issue={issue}
            timeline={timeline ? timeline.results : []}
          />
        );
      }}
    </Query>
  );
}
