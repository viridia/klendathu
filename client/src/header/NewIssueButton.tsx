import * as React from 'react';
import { observer } from 'mobx-react';
import { ProjectEnv } from '../models';
import { Role } from '../../../common/types/json';
import { NavContainer } from '../controls';
import AddBoxIcon from '../svg-compiled/icons/IcAddBox';
import { Button } from 'skyhook-ui';

export function NewIssueButtonImpl() {
  const { project, account } = React.useContext(ProjectEnv);
  if (account && project && project.role >= Role.REPORTER) {
    return (
      <NavContainer to={`/${account.accountName}/${project.name}/new`}>
        <Button variant="action">
          <AddBoxIcon />
          <span>New Issue</span>
        </Button>
      </NavContainer>
    );
  }
  return null;
}

export const NewIssueButton = observer(NewIssueButtonImpl);
