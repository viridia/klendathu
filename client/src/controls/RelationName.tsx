import * as React from 'react';
import { Relation } from '../../../common/types/graphql';

export const RELATION_NAMES: { [relation: string]: string } = {
  [Relation.BlockedBy]: 'blocked by',
  [Relation.Blocks]: 'blocks',
  [Relation.Duplicate]: 'duplicates',
  [Relation.Related]: 'related to',
  [Relation.PartOf]: 'subtask of',
  [Relation.HasPart]: 'contains ',
};

export function RelationName({ relation }: { relation: Relation }) {
  return <span className="relation">{RELATION_NAMES[relation]}</span>;
}
