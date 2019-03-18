import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IssueCompose } from './IssueCompose';
import { toast } from 'react-toastify';
import { ProjectEnv, ViewContext } from '../models';
import { IssueInput, Issue, Project } from '../../../common/types/graphql';
import gql from 'graphql-tag';
import { fragments, ErrorDisplay, updateIssue, newIssue } from '../graphql';
import { Query } from 'react-apollo';
import { decodeErrorAsException } from '../graphql/client';
import { idToIndex } from '../lib/idToIndex';

const IssueQuery = gql`
  query IssueQuery($id: ID!) {
    issue(id: $id) {
      ...IssueFields
      ownerAccount { ...AccountFields }
      ccAccounts { ...AccountFields }
    }
  }
  ${fragments.account}
  ${fragments.issue}
`;

interface Props extends RouteComponentProps<{ project: string; id: string }> {
  clone?: boolean;
  // milestones: MilestoneListQuery;
}

function saveIssue(issue: Issue, input: IssueInput, env: ViewContext) {
  return updateIssue({ id: issue.id, input }).then(({ data, errors }) => {
    if (errors) {
      env.error = errors[0];
      // TODO: more information
      toast.error('Issue update failed.');
    } else {
      toast.success(`Issue #${idToIndex(data.updateIssue.id)} updated.`);
      return data.updateIssue;
    }
  });
}

function createIssue(project: Project, input: IssueInput, env: ViewContext): Promise<Issue> {
  return newIssue({ project: project.id, input }).then(({ data, errors }) => {
    if (errors) {
      // TODO: more information
      env.error = errors[0];
      toast.error('Issue creation failed.');
    } else {
      toast.success(`Issue #${idToIndex(data.newIssue.id)} created.`);
      return data.newIssue;
    }
  });
}

export function IssueEditView(props: Props) {
  const env = React.useContext(ProjectEnv);
  const id = props.match.params.id;
  return (
    <Query query={IssueQuery} variables={{ id: `${env.project.id}.${id}` }}>
      {({ loading, error, data }) => {
        if (loading) {
          return null;
        } else if (error) {
          return <ErrorDisplay error={error} />;
        } else {
          const onSave = (input: IssueInput): Promise<Issue> => {
            if (props.clone) {
              return createIssue(env.project, input, env);
            } else {
              return saveIssue(data.issue, input, env);
            }
          };

          return <IssueCompose {...props} env={env} issue={data.issue} onSave={onSave} />;
        }
      }}
    </Query>
  );
}
