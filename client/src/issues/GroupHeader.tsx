import * as React from 'react';
import { AccountName } from '../controls';
import { ProjectEnv } from '../models';
import { IssueGroup } from '../models/IssueQueryModel';
import { styled } from '../style';

const GroupHeaderEl = styled.th`
  font-weight: normal;
  padding: .5rem 0;
  text-align: left;

  thead:first-child & {
    padding-top: 0;
  }

  > .unassigned {
    font-style: italic;
    color: ${props => props.theme.textMuted};
  }
`;

const GroupTitle = styled.span`
  font-weight: bold;
`;

interface Props {
  group: IssueGroup;
}

export function GroupHeader({ group }: Props) {
  const env = React.useContext(ProjectEnv);
  switch (group.field) {
    case 'owner':
      return (
        <GroupHeaderEl colSpan={100}>
          <GroupTitle>Owner: </GroupTitle>
          <AccountName id={group.value} />
        </GroupHeaderEl>
      );

    case 'reporter':
      return (
        <GroupHeaderEl colSpan={100}>
          <GroupTitle>Reporter: </GroupTitle>
          <AccountName id={group.value} />
        </GroupHeaderEl>
      );

    case 'type': {
      const typeInfo = env.template.types.find(t => t.id === group.value);
      return (
        <GroupHeaderEl colSpan={100}>
          <GroupTitle>Type: </GroupTitle>
          <span className="value">{typeInfo ? typeInfo.caption : group.value}</span>
        </GroupHeaderEl>
      );
    }

    case 'state': {
      const stateInfo = env.template.states.find(s => s.id === group.value);
      return (
        <GroupHeaderEl colSpan={100}>
          <GroupTitle>State: </GroupTitle>
          <span className="value">{stateInfo ? stateInfo.caption : group.value}</span>
        </GroupHeaderEl>
      );
    }

    default:
      return (
        <>
          <span className="title">{group.field} </span>
          <span className="value">{group.value}</span>
        </>
      );
  }
}
