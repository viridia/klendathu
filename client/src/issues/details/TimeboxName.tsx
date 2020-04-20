import * as React from 'react';
import { ProjectEnv } from '../../models';

interface Props {
  timebox: string;
}

export function TimeboxName({ timebox }: Props) {
  const env = React.useContext(ProjectEnv);
  const m = env.getTimebox(timebox);
  if (m) {
    return <span>{m.name}</span>;
  }
  return <span>none</span>;
}
