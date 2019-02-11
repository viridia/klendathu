import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { Template } from '../../../../common/types/json';

export class TypeColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('Type', 'type', 'type pad');
    this.template = template;
  }

  public render(issue: Issue) {
    const typeInfo = this.template.types.find(t => t.id === issue.type);
    if (!typeInfo) {
      return <td className="type" key="type">{issue.type}</td>;
    }
    return (
      <td className="type" key="type">
        <span style={{ backgroundColor: typeInfo.bg }}>{typeInfo.caption}</span>
      </td>
    );
  }
}
