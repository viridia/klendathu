import * as React from 'react';
import { ProjectEnv } from '../../models';

interface Props {
  milestone: string;
}

export function MilestoneName({ milestone }: Props) {
  const env = React.useContext(ProjectEnv);
  const m = env.getMilestone(milestone);
  if (m) {
    return <span>{m.name}</span>;
  }
  return <span>none</span>;
}