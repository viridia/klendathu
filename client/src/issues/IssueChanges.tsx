import * as React from 'react';
import { IssueChangeEntry } from '../../../common/types/graphql';
import { TimelineEntry } from '../timeline';
import styled from 'styled-components';

interface Props {
  changes: IssueChangeEntry[];
}

const IssueChangesLayout = styled.section`
  justify-self: stretch;
`;

export function IssueChanges({ changes }: Props) {
  return (
    <IssueChangesLayout className="changes-list">
      {changes.map(ch => <TimelineEntry key={ch.id} change={ch} />)}
    </IssueChangesLayout>
  );
}
