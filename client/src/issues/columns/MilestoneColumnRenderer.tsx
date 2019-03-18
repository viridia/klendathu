import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { ViewContext } from '../../models';

export class MilestoneColumnRenderer extends AbstractColumnRenderer {
  constructor(private env: ViewContext) {
    super('Milestone', 'milestone', 'milestone pad');
  }

  public render(issue: Issue) {
    const m = this.env.getMilestone(issue.milestone);
    if (!m) {
      return <td className="milestone center pad" key="milestone">--</td>;
    }
    return (
      <td className="milestone center pad" key="milestone">{m.name}</td>
    );
  }
}
