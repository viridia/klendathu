import * as React from 'react';
import { TimelineEntry, CustomFieldChange } from '../../../common/types/graphql';
import { AccountName, LabelName, RelativeDate } from '../controls';
import { LinkChangeDisplay } from './LinkChangeDisplay';
import { ProjectEnv } from '../models';
import styled from 'styled-components';
import { CommentDisplay } from './CommentDisplay';
import { IssueCondensedDisplay } from '../issues/IssueCondensedDisplay';

export function StateNameDisplay({ state }: { state: string }) {
  const env = React.useContext(ProjectEnv);
  const st = env.states.get(state);
  return (
    <span className="state">{st && st.caption || state}</span>
  );
}

const TimelineEntryLayout = styled.section`
  justify-self: stretch;
  grid-column: controls;
`;

const TimelineEntryHeader = styled.header`
  font-size: .9rem;
  padding: 0 8px 4px 0;
  line-height: 1.4em;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.cardHeaderDividerColor};
  color: ${props => props.theme.textMuted};

  .account-name {
    font-weight: bold;
    color: ${props => props.theme.textNormal};
  }
`;

const TimelineIssueName = styled.span`
  display: inline;
`;

const TimelineProperyList = styled.ul`
  margin: 6px 0 0 0;
  font-size: .9rem;
  padding-left: 2rem;
`;

const TimelinePropery = styled.li`
  padding: 2px 0;
  margin: 0;
  line-height: 1.1rem;

  .state, .type, .field-name, .custom-value, .attachment {
    font-weight: bold;
    color: ${props => props.theme.textAccented};
  }

  .attachment {
    font-family: monospace;
  }

  .custom-value-none {
    font-style: italic;
    color: ${props => props.theme.textMuted};
  }

  .unassigned {
    font-style: italic;
    color: ${props => props.theme.textMuted};
  }
`;

function customValue(value: string | number | boolean) {
  return value !== null
    ? <span className="custom-value">{value || '""'}</span>
    : <span className="custom-value-none">(none)</span>;
}

function customChange({ key, before, after }: CustomFieldChange) {
  return (
    <TimelinePropery className="field-change custom-field" key={key}>
      changed <span className="field-name">
        {key}
      </span> from {customValue(before)} to {customValue(after)}
    </TimelinePropery>);
}

interface Props {
  change: TimelineEntry;
  showIssue?: boolean;
}

export function TimelineEntryDisplay({ change, showIssue }: Props) {
  const {
    type,
    state,
    summary,
    description,
    owner,
    cc,
    labels,
    attachments,
    linked,
    custom,
  } = change;
  // If the change contains a comment body and no other changes, then we don't want to
  // display a change header. Thus is a side-effect of the fact that the timeline contains
  // both comments and change history records.
  const anyNonCommentChange = type || state || summary || description || owner || cc || labels
      || attachments || linked || custom;
  return (
    <TimelineEntryLayout>
      {anyNonCommentChange && <TimelineEntryHeader>
        <AccountName id={change.by} />
        &nbsp;made changes&nbsp;
        <RelativeDate date={change.at} withPrefix={true} />
        {showIssue && (
          <TimelineIssueName>&nbsp;to{' '}
            <IssueCondensedDisplay id={change.issue} />
          </TimelineIssueName>
        )}
        :
      </TimelineEntryHeader>}
      {anyNonCommentChange && <TimelineProperyList>
        {type && (
          <TimelinePropery>
            type: <span className="type">
              {type.before}
            </span> to <span className="type">
              {type.after}
            </span>
          </TimelinePropery>)}
        {state && (
          <TimelinePropery>
            state:{' '}
            <StateNameDisplay state={state.before} />
             {' '}to{' '}
             <StateNameDisplay state={state.after} />
          </TimelinePropery>)}
        {summary && (<TimelinePropery>
          changed <span className="field-name">summary</span> from &quot;
          {summary.before}&quot; to &quot;
          {summary.after}&quot;
        </TimelinePropery>)}
        {description && (<TimelinePropery>
          changed <span className="field-name">description</span>.
        </TimelinePropery>)}
        {owner &&
          <TimelinePropery>owner:{' '}
          <AccountName id={owner.before} />
          {' '}to{' '}
          <AccountName id={owner.after} />
          </TimelinePropery>}
        {cc && cc.added && cc.added.map(acc => (
          <TimelinePropery key={acc}>
            added <AccountName id={acc} /> to cc</TimelinePropery>))}
        {cc && cc.removed && cc.removed.map(acc => (
          <TimelinePropery key={acc}>
            removed <AccountName id={acc} /> from cc</TimelinePropery>))}
        {labels && labels.added && labels.added.map(l =>
          (<TimelinePropery key={l}>
            added label <LabelName id={l} key={l} />
          </TimelinePropery>))}
        {labels && labels.removed && labels.removed.map(l =>
          (<TimelinePropery key={l}>
            removed label <LabelName id={l} key={l} />
          </TimelinePropery>))}
        {attachments && attachments.added && attachments.added.map(a =>
          (<TimelinePropery key={a}>
            attached file <span className="attachment" />
          </TimelinePropery>))}
        {attachments && attachments.removed &&
            attachments.removed.map(a =>
          (<TimelinePropery key={a}>
            removed file <span className="attachment" />
          </TimelinePropery>))}
        {linked && linked.map(LinkChangeDisplay)}
        {custom && custom.map(customChange)}
        {/* {change.comments && change.comments.updated === 1 &&
          (<TimelinePropery>edited a comment</TimelinePropery>)
        }
        {change.comments && change.comments.updated > 1 &&
          (<TimelinePropery
           >edited {change.comments.updated} comments</TimelinePropery>)
        }
        {change.comments && change.comments.removed === 1 &&
          (<TimelinePropery>deleted a comment</TimelinePropery>)
        }
        {change.comments && change.comments.removed > 1 &&
          (<TimelinePropery
           >deleted {change.comments.removed} comments</TimelinePropery>)
        } */}
      </TimelineProperyList>}
      {change.commentBody && <CommentDisplay comment={change} />}
    </TimelineEntryLayout>
  );
}
