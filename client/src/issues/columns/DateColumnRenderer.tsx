import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { RelativeDate } from '../../controls';

export class DateColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        <RelativeDate date={new Date((issue as any)[this.fieldName])} brief={true} />
      </td>
    );
  }
}
