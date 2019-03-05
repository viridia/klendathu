import * as React from 'react';
import { AccountName } from '../controls';
import { ViewContext } from '../models';
import { IssueGroup } from '../models/IssueQueryModel';

interface Props {
  env: ViewContext;
  group: IssueGroup;
}

export class GroupHeader extends React.Component<Props> {
  public render() {
    const { group, env } = this.props;
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
        const typeInfo = env.template.types.find(t => t.id === group.value);
        return (
          <>
            <span className="title">Type: </span>
            <span className="value">{typeInfo ? typeInfo.caption : group.value}</span>
          </>
        );
      }

      case 'state': {
        const stateInfo = env.template.states.find(s => s.id === group.value);
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
