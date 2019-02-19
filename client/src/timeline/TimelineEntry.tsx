import * as React from 'react';
import { TimelineEntry, CustomFieldChange } from '../../../common/types/graphql';
import { AccountName, LabelName, RelativeDate } from '../controls';
import { LinkChangeDisplay } from './LinkChangeDisplay';
import { ProjectEnv } from '../models';
import styled from 'styled-components';

export function StateNameDisplay({ state }: { state: string }) {
  const env = React.useContext(ProjectEnv);
  const st = env.states.get(state);
  return (
    <span className="state">{st && st.caption || state}</span>
  );
}

const TimelineEntryLayout = styled.section`
  margin-bottom: 8px;
  justify-self: stretch;
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

const TimelineProperyList = styled.ul`
  margin: 6px 0 0 0;
  font-size: .9rem;
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

export function TimelineEntryDisplay({ change }: { change: TimelineEntry }) {
  return (
    <TimelineEntryLayout>
      <TimelineEntryHeader>
        <AccountName id={change.by} />
        &nbsp;made changes&nbsp;
        <RelativeDate date={change.at} withPrefix={true} />
        :
      </TimelineEntryHeader>
      <TimelineProperyList>
        {change.type && (
          <TimelinePropery>
            type: <span className="type">
              {change.type.before}
            </span> to <span className="type">
              {change.type.after}
            </span>
          </TimelinePropery>)}
        {change.state && (
          <TimelinePropery>
            state:{' '}
            <StateNameDisplay state={change.state.before} />
             {' '}to{' '}
             <StateNameDisplay state={change.state.after} />
          </TimelinePropery>)}
        {change.summary && (<TimelinePropery>
          changed <span className="field-name">summary</span> from &quot;
          {change.summary.before}&quot; to &quot;
          {change.summary.after}&quot;
        </TimelinePropery>)}
        {change.description && (<TimelinePropery>
          changed <span className="field-name">description</span>.
        </TimelinePropery>)}
        {change.owner &&
          <TimelinePropery>owner:{' '}
          <AccountName id={change.owner.before} />
          {' '}to{' '}
          <AccountName id={change.owner.after} />
          </TimelinePropery>}
        {change.cc && change.cc.added && change.cc.added.map(cc => (
          <TimelinePropery key={cc}>
            added <AccountName id={cc} /> to cc</TimelinePropery>))}
        {change.cc && change.cc.removed && change.cc.removed.map(cc => (
          <TimelinePropery key={cc}>
            removed <AccountName id={cc} /> from cc</TimelinePropery>))}
        {change.labels && change.labels.added && change.labels.added.map(l =>
          (<TimelinePropery key={l}>
            added label <LabelName id={l} key={l} />
          </TimelinePropery>))}
        {change.labels && change.labels.removed && change.labels.removed.map(l =>
          (<TimelinePropery key={l}>
            removed label <LabelName id={l} key={l} />
          </TimelinePropery>))}
        {change.attachments && change.attachments.added && change.attachments.added.map(a =>
          (<TimelinePropery key={a}>
            attached file <span className="attachment" />
          </TimelinePropery>))}
        {change.attachments && change.attachments.removed &&
            change.attachments.removed.map(a =>
          (<TimelinePropery key={a}>
            removed file <span className="attachment" />
          </TimelinePropery>))}
        {change.linked && change.linked.map(LinkChangeDisplay)}
        {change.custom && change.custom.map(customChange)}
        {/* {change.comments && change.comments.added === 1 &&
          (<TimelinePropery>added a comment</TimelinePropery>)
        }
        {change.comments && change.comments.added > 1 &&
          (<TimelinePropery
           >added {change.comments.added} comments</TimelinePropery>)
        }
        {change.comments && change.comments.updated === 1 &&
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
      </TimelineProperyList>
    </TimelineEntryLayout>
  );
}
