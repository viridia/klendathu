import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Subscription, Mutation } from '../../../common/types/graphql';
import { session, ProjectEnv } from '../models';
import { useQuery } from '@apollo/client';
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

export declare type IssueProviderProps = RouteComponentProps<{ project: string; id: string }>;

type IssueChangeResult = Pick<Subscription, 'issueChanged'>;
type AddCommentResult = Pick<Mutation, 'addComment'>;

export const IssueDetailsView = (props: IssueProviderProps) => {
  const { id } = props.match.params;
  const env = React.useContext(ProjectEnv);
  const { project } = env;
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
      env.mutationError = error;
      toast.error('Error posting comment.');
      console.error(error);
    });
  }

  const issueId = `${project.id}.${id}`;

  const { loading, error, data, refetch, subscribeToMore } = useQuery(IssueDetailsQuery, {
    variables: { issue: issueId },
    fetchPolicy: 'cache-and-network',
  });

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!data) {
    return null;
  }

  const { issue } = data;
  if (!issue) {
    return null;
  }

  if (session.account) {
    subscribeToMore<IssueChangeResult>({
      document: IssueSubscription,
      variables: { issue: issueId },
      updateQuery: (prev, { subscriptionData }) => {
        refetch();
        // TODO: For some reason, this is not working as expected. It gets executed,
        // but the query isn't re-rendered.
        // if (!subscriptionData.data.issueChanged) {
        //   return prev;
        // }
        // const updatedIssue = subscriptionData.data.issueChanged.value;
        // return {
        //   ...prev,
        //   issue: updatedIssue
        // };
      },
    });
  }

  return (
    <IssueDetails
      {...props}
      env={env}
      issue={issue}
      loading={loading}
      onAddComment={addComment}
    />
  );
};
