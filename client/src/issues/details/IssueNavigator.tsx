import * as React from 'react';
import { ProjectEnv } from '../../models';
import { Issue } from '../../../../common/types/graphql';
import { NavContainer } from '../../controls';

import ArrowBackIcon from '../../svg-compiled/icons/IcArrowBack';
import ArrowForwardIcon from '../../svg-compiled/icons/IcArrowForward';
import { LocationState } from 'history';
import { RouteComponentProps } from 'react-router';
import { ButtonGroup, Button } from 'skyhook-ui';

interface Props extends RouteComponentProps<{}, LocationState> {
  issue: Issue;
}

/** Component that iterates through prev / next issue */
export function IssueNavigator({ issue, location }: Props) {
  const env = React.useContext(ProjectEnv);
  if (!issue) {
    return null;
  }
  const { account, project, issues } = env;
  const [prevIssue, nextIssue] = issues.adjacentIssueIds(issue.id);
  return (
    <ButtonGroup className="issue-nav">
      <NavContainer
        to={{
          ...location,
          pathname: `/${account.accountName}/${project.name}/${prevIssue}` }}
      >
        <Button title="Previous issue" disabled={prevIssue === null}>
          <ArrowBackIcon />
        </Button>
      </NavContainer>
      <NavContainer
        to={{
          ...location,
          pathname: `/${account.accountName}/${project.name}/${nextIssue}` }}
      >
        <Button title="Next issue" disabled={nextIssue === null}>
          <ArrowForwardIcon />
        </Button>
      </NavContainer>
    </ButtonGroup>
  );
}
