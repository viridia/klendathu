import React from 'react';
import classNames from 'classnames';
import { Issue } from '../../../../common/types/graphql';
import { LabelName } from '../../controls';
import { styled } from '../../style';
import { ProjectEnv } from '../../models';

const SummaryEl = styled.span`
  margin-top: 2px;
  flex: 1;
  font-size: 1rem;

  &.large {
    line-height: 1rem;
    > .summary {
      font-size: 1rem;
    }
  }
  &.medium {
    line-height: .9rem;
    > .summary {
      font-size: .9rem;
    }
  }
  &.small {
    line-height: .7rem;
    > .summary {
      font-size: .7rem;
    }
  }

  .summary {
    margin-right: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .label-name {
    margin-right: auto;
    margin-left: 0;
    margin-bottom: 3px;
  }
`;

interface Props {
  issue: Issue;
  className?: string;
}

function summarySize(issue: Issue): string {
  if (issue.summary.length < 32) {
    return '1em';
  }
  if (issue.summary.length < 100) {
    return '.9em';
  }
  return '.8em';
}

export function ResponsiveIssueSummary({ issue, className }: Props) {
  const env = React.useContext(ProjectEnv);
  return (
    <SummaryEl className={classNames(summarySize(issue), className)}>
      <span className="summary">
        {issue.summary}
      </span>
      {issue.labels
        .filter(l => env.visibleLabels.has(l))
        .map(l => <LabelName id={l} key={l} size="smaller" />)}
    </SummaryEl>
  );
}
