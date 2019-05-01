import * as React from 'react';
import { Issue, Commit } from '../../../../common/types/graphql';
import { fragments, ErrorDisplay } from '../../graphql';
import { Query } from 'react-apollo';
import { session } from '../../models';
import gql from 'graphql-tag';
import { CommitLink } from './CommitLink';
import { FormControlGroup, FormLabel } from 'skyhook-ui';

const IssueCommitsQuery = gql`
  query IssueCommitsQuery($project: ID!, $issue: ID!) {
    commits(project: $project, issue: $issue) {
      count offset results { ...CommitFields }
    }
  }
  ${fragments.commit}
`;

interface Props {
  issue: Issue;
}

export function IssueCommits({ issue }: Props) {
  return (
    <Query
      query={IssueCommitsQuery}
      variables={{
        issue: issue.id,
        project: issue.project,
      }}
      fetchPolicy="cache-and-network"
    >
      {({ data, error, subscribeToMore, refetch }) => {
        if (error) {
          return (
            <FormControlGroup>
              <ErrorDisplay error={error} />
            </FormControlGroup>
          );
        }
        const { commits } = data;
        if (session.account && issue) {
          // subscribeToMore<TimelineChangeResult>({
          //   document: IssueTimelineSubscription,
          //   variables: {
          //     issue: issue.id,
          //     project: issue.project,
          //   },
          //   updateQuery: (prev, { subscriptionData }) => {
          //     // TODO: be smarter about updating the cache.
          //     // return {
          //     //   timeline: subscriptionData.data.timelineChanged.value,
          //     // };
          //     // console.log('prev', prev);
          //     // console.log('subscriptionData', subscriptionData);
          //     // // For the moment we're just going to refresh.
          //     // // console.log('subscriptionData', subscriptionData);
          //     refetch();
          //   },
          // });
        }

        if (commits && commits.results && commits.results.length > 0) {
          return (
            <React.Fragment>
              <FormLabel>Commits:</FormLabel>
              <FormControlGroup>
                {commits.results.map((cm: Commit) => <CommitLink key={cm.commit} commit={cm} />)}
              </FormControlGroup>
            </React.Fragment>
          );
        }
        return null;
      }}
    </Query>
  );
}
