import * as React from 'react';
import { LinkChange } from '../../../common/types/graphql';
import { RelationName } from '../controls';
import { IssueCondensedDisplay } from '../issues/IssueCondensedDisplay';
import styled from 'styled-components';

const IssueLinkItem = styled.li`
  margin: 4px 0 0 0;

  .relation {
    font-weight: bold;
    color: ${props => props.theme.textAccented};
    margin-right: 5px;
  }

  .issue {
    display: inline;
  }
`;

export function LinkChangeDisplay({ to, before, after }: LinkChange) {
  if (before && after) {
    return (
      <IssueLinkItem className="field-change linked-issue" key={to}>
        changed: <RelationName relation={before} />
        &nbsp;%raquo;&nbsp;
        <RelationName relation={after} />
        <IssueCondensedDisplay id={to} key={to} />
      </IssueLinkItem>
    );
  } else if (before) {
    return (
      <IssueLinkItem className="field-change linked-issue" key={to}>
        removed: <RelationName relation={before} />
        <IssueCondensedDisplay id={to} key={to} />
      </IssueLinkItem>
    );
  } else {
    return (
      <IssueLinkItem className="field-change linked-issue" key={to}>
        added: <RelationName relation={after} />
        <IssueCondensedDisplay id={to} key={to} />
      </IssueLinkItem>
    );
  }
}
