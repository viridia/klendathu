import * as React from 'react';
import { LeftNavLink } from './LeftNavLink';

import LabelIcon from '../svg-compiled/icons/IcLabel';
import ListIcon from '../svg-compiled/icons/IcList';
import PersonIcon from '../svg-compiled/icons/IcPerson';
// import BookmarkIcon from '../svg-compiled/icons/IcBookmark';
import SettingsIcon from '../svg-compiled/icons/IcSettings';
import DependenciesIcon from '../svg-compiled/icons/IcGantt';
import ProgressIcon from '../svg-compiled/icons/IcProgress';
import HistoryIcon from '../svg-compiled/icons/IcHistory';
import { LabelLinks } from './LabelLinks';
import { ViewContext } from '../models';
import { observer } from 'mobx-react';

interface Props {
  context: ViewContext;
}

function ProjectNavLinksImpl(props: Props) {
  const { project, account, prefs } = props.context;
  if (!project || !account) {
    return null;
  }
  const prefix = `/${account.accountName}/${project.name}`;
  return (
    <>
      <LeftNavLink
          to={`${prefix}/issues`}
          query={{ owner: undefined, label: undefined, type: undefined, state: undefined }}
      >
        <ListIcon /> All Issues
      </LeftNavLink>
      <LeftNavLink
          to={`${prefix}/issues`}
          query={{ owner: 'me', state: 'open' }}
      >
        <PersonIcon /> My Issues
      </LeftNavLink>
      {prefs && <LeftNavLink to={`${prefix}/labels`}>
        <LabelIcon /> Labels
      </LeftNavLink>}
      {prefs && <LabelLinks prefs={prefs} project={project} account={account} />}
      <LeftNavLink to={`${prefix}/progress`}>
        <ProgressIcon /> Progress
      </LeftNavLink>
      <LeftNavLink to={`${prefix}/dependencies`}>
        <DependenciesIcon /> Dependencies
      </LeftNavLink>
      <LeftNavLink to={`${prefix}/timeline`}>
        <HistoryIcon /> Timeline
      </LeftNavLink>
      <LeftNavLink to={`${prefix}/settings`}>
        <SettingsIcon /> Settings
      </LeftNavLink>
    </>
  );
}

export const ProjectNavLinks = observer(ProjectNavLinksImpl);
