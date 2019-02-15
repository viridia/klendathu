import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { Template } from '../../../../common/types/json';
import styled from 'styled-components';

const TypeCell = styled.td`
  text-align: center;
  > .badge {
    border-radius: 4px;
    display: inline-block;
    padding: 4px 12px;
  }
`;

export class TypeColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('Type', 'type', 'type pad');
    this.template = template;
  }

  public render(issue: Issue) {
    const typeInfo = this.template.types.find(t => t.id === issue.type);
    if (!typeInfo) {
      return <TypeCell key="type">{issue.type}</TypeCell>;
    }
    return (
      <TypeCell key="type">
        <div className="badge" style={{ backgroundColor: typeInfo.bg }}>{typeInfo.caption}</div>
      </TypeCell>
    );
  }
}
