import * as React from 'react';
import { ProjectPrefs, PublicAccount, Project } from '../../../common/types/graphql';
import { LabelName, QueryLink } from '../controls';
import styled from 'styled-components';

const LabelList = styled.ul`
  margin: 4px 0;
  padding-left: 30px;
  > li {
    margin: 4px 0;
    > a {
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

export function LabelLinks({ prefs, account, project }: Props) {
  if (!account || !project) {
    return null;
  }
  return (
    <LabelList>
      {prefs.labels.map(labelId => (
        <li key={labelId}>
          <QueryLink
              to={`/${account.accountName}/${project.name}/issues`}
              query={{ label: labelId.split('.', 2)[1] }}
          >
            <LabelName id={labelId} small={true} />
          </QueryLink>
        </li>
      ))}
    </LabelList>
  );
}
