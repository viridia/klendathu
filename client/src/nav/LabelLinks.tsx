import * as React from 'react';
import { ProjectPrefs } from '../../../common/types/graphql';
import { LabelName } from '../controls/LabelName';
import styled from 'styled-components';

const LabelList = styled.ul`
  margin: 4px 0;
  padding-left: 30px;
  > li {
    margin: 4px 0;
  }
`;

interface Props {
  prefs: ProjectPrefs;
}

export function LabelLinks({ prefs }: Props) {
  return (
    <LabelList>
      {prefs.labels.map(labelId => (
        <li key={labelId}><LabelName id={labelId} small={true} /></li>
      ))}
    </LabelList>
  );
}
