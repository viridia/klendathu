import * as React from 'react';
import { TimelineEntry } from '../../../common/types/graphql';
import { TimelineEntryDisplay } from '../timeline';
import styled from 'styled-components';

interface Props {
  changes: TimelineEntry[];
}

const IssueTimelineLayout = styled.section`
  justify-self: stretch;
`;

export function IssueTimeline({ changes }: Props) {
  return (
    <IssueTimelineLayout className="changes-list">
      {changes.map(ch => <TimelineEntryDisplay key={ch.id} change={ch} />)}
    </IssueTimelineLayout>
  );
}
