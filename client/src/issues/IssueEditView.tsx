import * as React from 'react';
// import { MilestoneListQuery } from '../../models';
import { RouteComponentProps } from 'react-router-dom';
import { IssueCompose } from './IssueCompose';
// import { toast } from 'react-toastify';
import { ViewContext } from '../models';
import { IssueInput, Issue } from '../../../common/types/graphql';
import gql from 'graphql-tag';
import { fragments, ErrorDisplay } from '../graphql';
import { Query } from 'react-apollo';

const IssueQuery = gql`
  query IssueQuery($id: ID) {
    issue(id: $id) { ...IssueFields }
  }
  ${fragments.issue}
`;

// interface IssueQueryResult {
//   issue: Issue;
// }

interface Props extends RouteComponentProps<{ project: string; id: string }> {
  context: ViewContext;
  // milestones: MilestoneListQuery;
}

export function IssueEditView(props: Props) {
  return (
    <Query query={IssueQuery} variables={{ id: props.match.params.id }}>
      {({ loading, error, data }) => {
        if (loading) {
          return null;
        } else if (error) {
          return <ErrorDisplay error={error} />;
        } else {
          const onSave = (input: IssueInput): Promise<Issue> => {
            // return updateIssue(issue.id, input).then(resp => {
            //   toast.success(`Issue #${issue.index} updated.`);
            // });
            return null;
          };

          return <IssueCompose {...props} issue={data.issue} onSave={onSave} />;
        }

      }}
    </Query>
  );
}
