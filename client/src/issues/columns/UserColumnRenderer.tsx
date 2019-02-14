import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { AccountName } from '../../controls';

export class UserColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    const userId: string = (issue as any)[this.fieldName];
    if (!userId) {
      return (
        <td className={this.className} key={this.fieldName}>
          <div className="unassigned">unassigned</div>
        </td>
      );
    }
    return (
      <td className={this.className} key={this.fieldName}>
        <AccountName id={userId} />
      </td>
    );
  }
}
