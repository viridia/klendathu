import * as React from 'react';
import { DropdownButton, MenuItem, RelationName, RELATION_NAMES } from '../../controls';
import { Relation } from '../../../../common/types/graphql';

const RELATIONS: Relation[] = [
  Relation.Blocks,
  Relation.BlockedBy,
  Relation.Duplicate,
  Relation.HasPart,
  Relation.PartOf,
  Relation.Related,
];

interface Props {
  value: Relation;
  onChange(relation: Relation): void;
}

export function RelationSelector({ value, onChange }: Props) {
  return (
    <DropdownButton
      id="issue-link-type"
      title={RELATION_NAMES[value]}
      onSelect={r => onChange(r as Relation)}
    >
      {RELATIONS.map(r => (
        <MenuItem key={r} eventKey={r} active={r === value}>
          <RelationName relation={r} />
        </MenuItem>))}
    </DropdownButton>
  );
}
