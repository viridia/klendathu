import * as React from 'react';
import { AccountName } from '../controls';
import { ProjectEnv } from '../models';
import { IssueGroup } from '../models/IssueQueryModel';
import { styled } from '../style';

const GroupHeaderEl = styled.header`
  margin-bottom: .8rem;

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
        <GroupHeaderEl>
          <GroupTitle>Owner: </GroupTitle>
          <AccountName id={group.value} />
        </GroupHeaderEl>
      );
    case 'reporter':
      return (
        <GroupHeaderEl>
          <GroupTitle>Reporter: </GroupTitle>
          <AccountName id={group.value} />
        </GroupHeaderEl>
      );

    case 'type': {
      const typeInfo = env.template.types.find(t => t.id === group.value);
      return (
        <GroupHeaderEl>
          <GroupTitle>Type: </GroupTitle>
          <span className="value">{typeInfo ? typeInfo.caption : group.value}</span>
        </GroupHeaderEl>
      );
    }

    case 'state': {
      const stateInfo = env.template.states.find(s => s.id === group.value);
      return (
        <GroupHeaderEl>
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
