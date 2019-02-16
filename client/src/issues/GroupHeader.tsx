import * as React from 'react';
import { IssueGroup } from '../../models';
import { AccountName } from '../controls';
import { Project } from '../../../common/types/graphql';

interface Props {
  project: Project;
  group: IssueGroup;
}

export class GroupHeader extends React.Component<Props> {
  public render() {
    const { group, project } = this.props;
    switch (group.field) {
      case 'owner':
        return (
          <>
            <span className="title">Owner: </span>
            <AccountName id={group.value} />
          </>
        );
      case 'reporter':
        return (
          <>
            <span className="title">Reporter: </span>
            <AccountName id={group.value} />
          </>
        );

      case 'type': {
        const typeInfo = project.template.types.find(t => t.id === group.value);
        return (
          <>
            <span className="title">Type: </span>
            <span className="value">{typeInfo ? typeInfo.caption : group.value}</span>
          </>
        );
      }

      case 'state': {
        const stateInfo = project.template.states.find(s => s.id === group.value);
        return (
          <>
            <span className="title">State: </span>
            <span className="value">{stateInfo ? stateInfo.caption : group.value}</span>
          </>
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
}
