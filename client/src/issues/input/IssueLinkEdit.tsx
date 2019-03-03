import * as React from 'react';
import { Button } from '../../controls';
import { IssueSelector } from './IssueSelector';
import { Relation, Issue } from '../../../../common/types/graphql';
import { styled } from '../../style';
import { ProjectEnv } from '../../models';
import { RelationSelector } from './RelationSelector';

interface Props {
  issue: Issue;
  exclude?: Set<string>;
  onLink(relation: Relation, target: Issue): void;
}

const IssueLinkEditEl = styled.div`
  display: flex;
  align-items: stretch;

  > .ac-issue {
    flex: 1;
    margin: 0 4px;
    max-width: 30rem;
  }
`;

export function IssueLinkEdit({ issue, onLink, exclude }: Props) {
  const [relation, setRelation] = React.useState(Relation.BlockedBy);
  const [target, setTarget] = React.useState<Issue>(null);
  const env = React.useContext(ProjectEnv);

  return (
    <IssueLinkEditEl>
      <RelationSelector value={relation} onChange={setRelation} />
      <IssueSelector
          className="ac-issue"
          env={env}
          placeholder="select an issue..."
          exclude={exclude}
          selection={target}
          onSelectionChange={i => setTarget(i as Issue)}
          onAcceptSuggestion={() => {
            onLink(relation, target);
            setTarget(null);
          }}
      />
      <Button
          onClick={(e: any) => {
            e.preventDefault();
            onLink(relation, target);
            setTarget(null);
          }}
          disabled={!target}
      >
        Add
      </Button>
    </IssueLinkEditEl>
  );
}
