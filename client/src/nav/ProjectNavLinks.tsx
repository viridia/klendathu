import * as React from 'react';
import { observer } from 'mobx-react';
// import { QueryLink } from './QueryLink';
// import { AccountProvider } from '../common/AccountProvider';
// import { LabelLinks } from './LabelLinks';
import { NavLink, RouteComponentProps } from 'react-router-dom';

// import LabelIcon from '../svg-compiled/icons/IcLabel';
// import ListIcon from '../svg-compiled/icons/IcList';
// import PersonIcon from '../svg-compiled/icons/IcPerson';
// import BookmarkIcon from '../svg-compiled/icons/IcBookmark';
import SettingsIcon from '../svg-compiled/icons/IcSettings';
import DependenciesIcon from '../svg-compiled/icons/IcGantt';
import ProgressIcon from '../svg-compiled/icons/IcProgress';
import HistoryIcon from '../svg-compiled/icons/IcHistory';

type Props = RouteComponentProps<{ account: string, project: string }>;

@observer
export class ProjectNavLinks extends React.Component<Props> {
  public render() {
    const { account, project } = this.props.match.params;
    return (
      <>
        {/* <QueryLink
            to={`/${account}/${project}/issues`}
            query={{ owner: undefined, label: undefined, type: undefined, state: undefined }}
        >
          <ListIcon /> All Issues
        </QueryLink>
        <QueryLink to={`/${account}/${project}/issues`} query={{ owner: 'me', state: 'open' }}>
          <PersonIcon /> My Issues
        </QueryLink>
        <NavLink to={{ pathname: `/${account}/${project}/labels` }}>
          <LabelIcon /> Labels
        </NavLink>
        <AccountProvider account={account}>
          {acc => <>
            <LabelLinks {...this.props} account={acc} project={project} />
            <NavLink to={{ pathname: `/${account}/${project}/filters` }}>
              <BookmarkIcon /> Saved Filters
            </NavLink>
          </>}
        </AccountProvider> */}
        <NavLink to={{ pathname: `/${account}/${project}/progress` }}>
          <ProgressIcon /> Progress
        </NavLink>
        <NavLink to={{ pathname: `/${account}/${project}/dependencies` }}>
          <DependenciesIcon /> Dependencies
        </NavLink>
        <NavLink to={{ pathname: `/${account}/${project}/history` }}>
          <HistoryIcon /> Changes
        </NavLink>
        <NavLink to={{ pathname: `/${account}/${project}/settings` }}>
          <SettingsIcon /> Settings
        </NavLink>
      </>
    );
  }
}
