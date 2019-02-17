import * as React from 'react';
import { DropdownButton, MenuItem, RelationName, Button, RELATION_NAMES } from '../../controls';
import { IssueSelector } from './IssueSelector';
import { Relation, Issue } from '../../../../common/types/graphql';
import { styled } from '../../style';
import { ProjectEnv } from '../../models';

const RELATIONS: Relation[] = [
  Relation.Blocks,
  Relation.BlockedBy,
  Relation.Duplicate,
  Relation.HasPart,
  Relation.PartOf,
  Relation.Related,
];

interface Props {
  issue: Issue;
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

export function IssueLinkEdit({ issue, onLink }: Props) {
  const [relation, setRelation] = React.useState(Relation.BlockedBy);
  const [target, setTarget] = React.useState<Issue>(null);
  const env = React.useContext(ProjectEnv);

  return (
    <IssueLinkEditEl>
      <DropdownButton
        id="issue-link-type"
        title={RELATION_NAMES[relation]}
        onSelect={r => setRelation(r as Relation)}
      >
        {RELATIONS.map(r => (
          <MenuItem key={r} eventKey={r} active={r === relation}>
            <RelationName relation={r} />
          </MenuItem>))}
      </DropdownButton>
      <IssueSelector
          className="ac-issue"
          env={env}
          placeholder="select an issue..."
          exclude={issue && issue.id}
          selection={target}
          onSelectionChange={i => setTarget(i as Issue)}
          // onEnter={this.onAddIssueLink}
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
