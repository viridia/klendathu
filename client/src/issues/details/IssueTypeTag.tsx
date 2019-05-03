import * as React from 'react';
import { Issue } from '../../../../common/types/graphql';
import { styled } from '../../style';
import { ProjectEnv } from '../../models';

const IssueTypeTagEl = styled.span`
  padding: 2px 4px;
  font-size: .8rem;
  font-weight: bold;
  border-radius: 3px;
`;

interface Props {
  issue: Issue;
}

export function IssueTypeTag({ issue }: Props) {
  const env = React.useContext(ProjectEnv);
  const typeInfo = env.types.get(issue.type);
  if (!typeInfo) {
    return <IssueTypeTagEl className="type">{issue.type}</IssueTypeTagEl>;
  }
  return (
    <IssueTypeTagEl
      className="type"
      style={{ backgroundColor: typeInfo.bg }}
    >{typeInfo.caption}</IssueTypeTagEl>
  );
}
