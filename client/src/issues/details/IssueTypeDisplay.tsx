import * as React from 'react';
import { ProjectEnv } from '../../models';
import { Issue } from '../../../../common/types/graphql';
import styled from 'styled-components';

interface Props {
  issue: Issue;
}

const IssueTypeEl = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 4px 12px;
`;

export function IssueTypeDisplay({ issue }: Props) {
  const env = React.useContext(ProjectEnv);
  const issueType = issue && env.getInheritedIssueType(issue.type);
  if (!issueType) {
    return null;
  }
  return (
    <IssueTypeEl className="issue-type" style={{ backgroundColor: issueType.bg }}>
      {issueType.caption}
    </IssueTypeEl>
  );
}
