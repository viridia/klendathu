import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IssueCompose } from './IssueCompose';
import { toast } from 'react-toastify';
import { IssueInput, Issue } from '../../../common/types/graphql';
import { ViewContext } from '../models';
import { fragments } from '../graphql';
import { client, decodeErrorAsException } from '../graphql/client';
import gql from 'graphql-tag';

const NewIssueMutation = gql`
  mutation NewIssueMutation($project: ID!, $input: IssueInput!) {
    newIssue(project: $project, input: $input) { ...IssueFields }
  }
  ${fragments.issue}
`;

interface Props extends RouteComponentProps<{}> {
  context: ViewContext;
}

export function IssueCreateView(props: Props) {
  const onSave = (input: IssueInput): Promise<Issue> => {
    const { project } = props.context;
    return client.mutate<{ newIssue: Issue }>({
      mutation: NewIssueMutation,
      variables: { project: project.id, input }
    }).then(({ data, errors }) => {
      if (errors) {
        // TODO: more information
        toast.error('Issue creation failed.');
        // TODO: An error UI.
        decodeErrorAsException(errors);
      } else {
        toast.success(`Issue #${data.newIssue.id.split('.')[1]} created.`);
        return data.newIssue;
      }
    });
  };

  return <IssueCompose {...props} onSave={onSave} />;
}
