import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewContext } from '../models';
import { Role } from '../../../common/types/json';
import { NavContainer } from '../controls';
import AddBoxIcon from '../svg-compiled/icons/IcAddBox';
import { Button } from 'skyhook-ui';

interface Props {
  context: ViewContext;
}

export function NewIssueButtonImpl({ context }: Props) {
  const { project, account } = context;
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
