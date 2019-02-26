import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Subscription, Mutation } from '../../../common/types/graphql';
import { ViewContext, session } from '../models';
import { Query } from 'react-apollo';
import { fragments, ErrorDisplay } from '../graphql';
import { IssueDetails } from './IssueDetails';
import { client } from '../graphql/client';
import { toast } from 'react-toastify';
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

const AddCommentMutation = gql`
  mutation AddCommentMutation($id: ID!, $body: String!) {
    addComment(id: $id, body: $body) { ...TimelineEntryFields }
  }
  ${fragments.timelineEntry}
`;

export interface IssueProviderProps extends RouteComponentProps<{ project: string, id: string }> {
  env: ViewContext;
}

type IssueChangeResult = Pick<Subscription, 'issueChanged'>;
type AddCommentResult = Pick<Mutation, 'addComment'>;

export const IssueDetailsView = (props: IssueProviderProps) => {
  const { id } = props.match.params;
  const { project } = props.env;
  if (!project) {
    return null;
  }

  function addComment(body: string) {
    client.mutate<AddCommentResult>({
      mutation: AddCommentMutation,
      variables: {
        id: `${project.id}.${id}`,
        body,
      }
    }).then(() => {
      toast.success('Comment posted.');
    }, error => {
      props.env.mutationError = error;
      toast.error('Error posting comment.');
      console.log(error);
    });
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
          const { issue } = data;
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
              },
            });
          }

          return (
            <IssueDetails
                {...props}
                issue={issue}
                loading={loading}
                onAddComment={addComment}
            />
          );
        }}
      </Query>
    </React.Fragment>
  );
};
