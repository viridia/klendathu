import * as React from 'react';
import { Issue } from '../../../common/types/graphql';
import { styled } from '../style';
import { idToIndex } from '../lib/idToIndex';
import { IssueTypeTag, ResponsiveIssueSummary } from './details';

const IssueTooltipDiv = styled.div`
  font-size: .9rem;
  max-width: 20rem;
  text-align: left;
  user-select: none;

  > .index {
    margin-right: 4px;
  }

  > .type {
    display: inline;
    margin-right: 4px;
  }
`;

const IssueTooltipBody = styled(ResponsiveIssueSummary)`
  display: inline;
`;

interface Props {
  issue: Issue;
}

export function IssueTooltip({ issue }: Props) {
  const index = idToIndex(issue.id);
  return (
    <IssueTooltipDiv>
      #<span className="index">{index}</span>
      <IssueTypeTag issue={issue} />
      <IssueTooltipBody issue={issue} />
    </IssueTooltipDiv>
  );
}
