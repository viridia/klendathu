import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Subscription } from '../../../common/types/graphql';
import { ViewContext, session } from '../models';
import { Query } from 'react-apollo';
import { fragments, ErrorDisplay } from '../graphql';
import { IssueDetails } from './IssueDetails';
import gql from 'graphql-tag';

const IssueDetailsQuery = gql`
  query IssueQuery($issue: ID!) {
    issue(id: $issue) { ...IssueFields }
  }
  ${fragments.issue}
`;

const IssueSubscription = gql`
  subscription IssueSubscription($issue: ID!) {
    issueChanged(issue: $issue) {
      action
      value { ...IssueFields }
    }
  }
  ${fragments.issue}
`;

export interface IssueProviderProps extends RouteComponentProps<{ project: string, id: string }> {
  context: ViewContext;
}

type IssueChangeResult = Pick<Subscription, 'issueChanged'>;

export const IssueDetailsView = (props: IssueProviderProps) => {
  const { id } = props.match.params;
  const { project } = props.context;
  if (!project) {
    return null;
  }
  return (
    <React.Fragment>
      <Query
          query={IssueDetailsQuery}
          variables={{
            issue: `${project.id}.${id}`,
          }}
          fetchPolicy="cache-and-network"
      >
        {({ data, error, loading, subscribeToMore, refetch }) => {
          if (error) {
            return <ErrorDisplay error={error} />;
          }
          const { issue, timeline } = data;
          if (session.account && issue) {
            subscribeToMore<IssueChangeResult>({
              document: IssueSubscription,
              variables: {
                issue: issue.id,
              },
              updateQuery: (prev, { subscriptionData }) => {
                return {
                  issue: subscriptionData.data.issueChanged.value,
                };
                // console.log('prev', prev);
                // console.log('subscriptionData', subscriptionData);
                // // For the moment we're just going to refresh.
                // // console.log('subscriptionData', subscriptionData);
                // refetch();
              },
            });
          }

          return (
            <IssueDetails
                {...props}
                issue={issue}
                loading={loading}
            />
          );
        }}
      </Query>
    </React.Fragment>
  );
};
