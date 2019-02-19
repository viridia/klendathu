import * as React from 'react';
import { LinkChange } from '../../../common/types/graphql';
import { RelationName } from '../controls';
import { IssueCondensedDisplay } from '../issues/IssueCondensedDisplay';

export function LinkChangeDisplay({ to, before, after }: LinkChange) {
  if (before && after) {
    return (
      <li className="field-change linked-issue" key={to}>
        changed <RelationName relation={before} />
        &nbsp;%raquo;&nbsp;
        <RelationName relation={after} />
        <IssueCondensedDisplay id={to} key={to} />
      </li>
    );
  } else if (before) {
    return (
      <li className="field-change linked-issue" key={to}>
        removed <RelationName relation={before} />
        <IssueCondensedDisplay id={to} key={to} />
      </li>
    );
  } else {
    return (
      <li className="field-change linked-issue" key={to}>
        added <RelationName relation={after} />
        <IssueCondensedDisplay id={to} key={to} />
      </li>
    );
  }
}
