import * as React from 'react';
import { ProjectEnv } from '../../models';
import { Issue } from '../../../../common/types/graphql';

interface Props {
  issue: Issue;
}

export function IssueTypeDisplay({ issue }: Props) {
  const env = React.useContext(ProjectEnv);
  const issueType = issue && env.getInheritedIssueType(issue.type);
  return (
    <div className="stretch">
      {issue && (
        <div className="issue-type" style={{ backgroundColor: issueType.bg }}>
          {issueType.caption}
        </div>)}
    </div>
  );
}
