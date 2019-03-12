import * as React from 'react';
import * as qs from 'qs';
import { ProjectPrefs, PublicAccount, Project } from '../../../common/types/graphql';
import { QueryLink } from '../controls';
import styled from 'styled-components';

const FilterList = styled.ul`
  margin: 0;
  padding-left: 30px;
  > li {
    margin: 4px 0;
    > a {
      color: ${props => props.theme.leftNavTextColor};
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
      &.active {
        font-weight: bold;
        text-decoration: none;
      }
    }
  }
`;

interface Props {
  project: Project;
  account: PublicAccount;
  prefs: ProjectPrefs;
}

function parseFilterString(query: string): any {
  try {
    return qs.parse(query, { ignoreQueryPrefix: true });
  } catch (e) {
    return {};
  }
}

export function FilterLinks({ prefs, account, project }: Props) {
  if (!account || !project) {
    return null;
  }
  return (
    <FilterList>
      {prefs.filters.map(filter => (
        <li key={filter.name}>
          <QueryLink
              to={`/${account.accountName}/${project.name}/${filter.view}`}
              query={parseFilterString(filter.value)}
              strict={true}
          >
            <span>{filter.name}</span>
          </QueryLink>
        </li>
      ))}
    </FilterList>
  );
}
