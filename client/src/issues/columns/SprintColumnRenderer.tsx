import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { SprintName } from '../../controls/SprintName';
import { styled } from '../../style';

const Sprints = styled.div`
  display: block;
  padding-top: 3px;
  margin-left: 4px;
  min-width: 8rem;
  .sprint {
    margin-bottom: 3px;
  }
`;

export class SprintColumnRenderer extends AbstractColumnRenderer {
  constructor() {
    super('Sprint', 'sprint', 'sprint pad');
  }

  public render(issue: Issue) {
    return (
      <td className="sprint center" key="sprint">
        <Sprints>
          {issue.sprints.map(sp => <SprintName key={sp} sprint={sp} />)}
        </Sprints>
      </td>
    );
  }
}
