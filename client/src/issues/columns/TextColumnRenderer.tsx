import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';

export class TextColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        {(issue as any)[this.fieldName]}
      </td>
    );
  }
}
