import React from 'react';
import classNames from 'classnames';
import { Chip } from 'skyhook-ui';
import { ProjectEnv } from '../models';
import { styled } from '../style';
import { timeboxBgColors } from '../style/milestoneColors';

interface Props {
  sprint: string;
  className?: string;
}

export const SprintChip = styled(Chip)`
  margin-right: 4px;
`;

export function SprintName({ sprint, className }: Props) {
  const env = React.useContext(ProjectEnv);
  const sp = env.getTimebox(sprint);
  if (sp) {
    return (
      <SprintChip
        className={classNames(className, 'sprint')}
        color={timeboxBgColors[sp.status]}
      >
        {sp.name}
      </SprintChip>
    );
  } else {
    return <SprintChip className={classNames(className, 'sprint')}>unknown</SprintChip>;
  }
}
