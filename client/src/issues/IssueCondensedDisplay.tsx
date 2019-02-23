import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { ProjectEnv } from '../models';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { fragments } from '../graphql';
import { Issue } from '../../../common/types/graphql';
import { idToIndex } from '../lib/idToIndex';
import styled from 'styled-components';

const IssueQuery = gql`
  query IssueQuery($id: ID!) {
    issue(id: $id) { ...IssueFields }
  }
  ${fragments.issue}
`;

const IssueCondensedEl = styled.div`
  align-items: flex-start;
  color: ${props => props.theme.textNormal};
  display: flex;
  overflow-x: hidden;

  > .id {
    font-weight: bold;
    margin-right: .3rem;
  }

  > .summary {
    overflow: hidden;
  }
`;

interface Props {
  id: string;
  link?: boolean;
}

/** Component that displays an issue as a single-line summary. */
export function IssueCondensedDisplay(props: Props) {
  const env = React.useContext(ProjectEnv);
  const { id, link } = props;
  const issueIndex = idToIndex(id);
  return (
    <Query query={IssueQuery} variables={{ id }}>
      {({ data, loading, error }) => {
        if (error) {
          return <div>Error Loading Issue #{issueIndex}</div>;
        } else if (loading) {
          return <div>Loading&hellip;...</div>;
        } else if (data && data.issue) {
          const { account, project } = env;
          const issue: Issue = data.issue;
          if (link) {
            return (
              <NavLink to={`/${account.accountName}/${project.name}/${issueIndex}`}>
                <IssueCondensedEl className="issue">
                  <span className="id">#{issueIndex}:</span>
                  <span className="summary">{issue.summary}</span>
                </IssueCondensedEl>
              </NavLink>
            );
          } else {
            return (
              <IssueCondensedEl className="issue">
                <span className="id">#{issueIndex}:</span>
                <span className="summary">{issue.summary}</span>
              </IssueCondensedEl>
            );
          }
        }
      }}
    </Query>
  );
}
