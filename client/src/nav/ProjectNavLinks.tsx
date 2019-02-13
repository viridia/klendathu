import * as React from 'react';
import { observer } from 'mobx-react';
// import { AccountProvider } from '../common/AccountProvider';
// import { LabelLinks } from './LabelLinks';
import { RouteComponentProps } from 'react-router-dom';
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
import gql from 'graphql-tag';
import { fragments } from '../graphql';
import { Query } from 'react-apollo';

const ProjectContextQuery = gql`
  query ProjectContextQuery($owner: String!, $name: String!) {
    projectContext(owner: $owner, name: $name) {
      project { ...ProjectFields }
      account { ...AccountFields }
      prefs { columns labels filters { name } }
      template
    }
  }
  ${fragments.project}
  ${fragments.account}
`;

type Props = RouteComponentProps<{ account: string, project: string }>;

@observer
export class ProjectNavLinks extends React.Component<Props> {
  public render() {
    const { account, project: name } = this.props.match.params;
    return (
      <Query
          query={ProjectContextQuery}
          variables={{
            owner: account,
            name,
          }}
      >
        {({ loading, error, data }) => {
          const project = !loading && !error ? data.projectContext.project : null;
          return (
            <>
              <LeftNavLink
                  to={`/${account}/${project}/issues`}
                  query={{ owner: undefined, label: undefined, type: undefined, state: undefined }}
              >
                <ListIcon /> All Issues
              </LeftNavLink>
              <LeftNavLink
                  to={`/${account}/${project}/issues`}
                  query={{ owner: 'me', state: 'open' }}
              >
                <PersonIcon /> My Issues
              </LeftNavLink>
              <LeftNavLink to={`/${account}/${project}/labels`}>
                <LabelIcon /> Labels
              </LeftNavLink>
              {project && <LabelLinks project={project} />}
              <LeftNavLink to={`/${account}/${project}/progress`}>
                <ProgressIcon /> Progress
              </LeftNavLink>
              <LeftNavLink to={`/${account}/${project}/dependencies`}>
                <DependenciesIcon /> Dependencies
              </LeftNavLink>
              <LeftNavLink to={`/${account}/${project}/history`}>
                <HistoryIcon /> Changes
              </LeftNavLink>
              <LeftNavLink to={`/${account}/${project}/settings`}>
                <SettingsIcon /> Settings
              </LeftNavLink>
            </>
          );
        }}
      </Query>
    );
  }
}
