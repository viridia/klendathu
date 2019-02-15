import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { AccountName } from '../../controls';
import styled from 'styled-components';

const UserCell = styled.td`
  text-align: center;
  white-space: nowrap;

  > .unassigned {
    font-style: italic;
    color: ${props => props.theme.textDarkDisabled}
  }
`;

export class UserColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    const userId: string = (issue as any)[this.fieldName];
    if (!userId) {
      return (
        <UserCell className={this.className} key={this.fieldName}>
          <div className="unassigned">unassigned</div>
        </UserCell>
      );
    }
    return (
      <UserCell className={this.className} key={this.fieldName}>
        <AccountName id={userId} />
      </UserCell>
    );
  }
}
