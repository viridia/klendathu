import * as React from 'react';
import { styled } from '../style';
import { darken } from 'polished';
import { ProjectNavLinks } from './ProjectNavLinks';
import { LeftNavLink } from './LeftNavLink';

import AppsIcon from '../svg-compiled/icons/IcApps';
import { ViewContext } from '../models';
import { observer } from 'mobx-react';

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

function LeftNavImpl({ context }: Props) {
  return (
    <NavLayout>
      <ProjectNavLinks context={context} />
      <LeftNavLink to={'/projects'}>
        <AppsIcon /> Projects
      </LeftNavLink>
    </NavLayout>
  );
}

export const LeftNav = observer(LeftNavImpl);
