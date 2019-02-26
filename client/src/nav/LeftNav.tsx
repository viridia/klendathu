import * as React from 'react';
import { styled } from '../style';
import { darken } from 'polished';
import { ProjectNavLinks } from './ProjectNavLinks';
import { LeftNavLink } from './LeftNavLink';

import AppsIcon from '../svg-compiled/icons/IcApps';
import { ViewContext } from '../models';
import { Route } from 'react-router';
import { ProjectLinks } from './ProjectLinks';

const NavLayout = styled.nav`
  background-color: ${props => props.theme.leftNavBgColor};
  border-right: 1px solid ${props => darken(0.1, props.theme.leftNavBgColor)};
  color: ${props => props.theme.leftNavTextColor};
  display: flex;
  flex-direction: column;
  grid-area: nav;
  padding: 16px 8px;
`;

interface Props {
  context: ViewContext;
}

export function LeftNav({ context }: Props) {
  return (
    <NavLayout>
      {/* Inject location to force MobX to update on location change. */}
      <Route render={props => <ProjectNavLinks context={context} {...props} />}/>
      <LeftNavLink to={'/projects'}>
        <AppsIcon /> Projects
      </LeftNavLink>
      <ProjectLinks />
    </NavLayout>
  );
}
