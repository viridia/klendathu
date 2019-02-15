import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { Template } from '../../../../common/types/json';
import { styled } from '../../style';

const StateCell = styled.td`
  text-align: center;
`;

export class StateColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('State', 'state', 'state pad');
    this.template = template;
  }

  public render(issue: Issue) {
    const stateInfo = this.template.states.find(s => s.id === issue.state);
    if (!stateInfo) {
      return <StateCell key="state">{issue.state}</StateCell>;
    }
    return (
      <StateCell key="state">{stateInfo.caption}</StateCell>
    );
  }
}
