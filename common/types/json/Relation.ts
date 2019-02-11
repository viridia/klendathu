import { Relation } from '../graphql';

export const inverseRelations: { [fwd: string]: Relation } = {
  [Relation.BlockedBy]: Relation.Blocks,
  [Relation.Blocks]: Relation.BlockedBy,
  [Relation.PartOf]: Relation.HasPart,
  [Relation.HasPart]: Relation.PartOf,
  [Relation.Related]: Relation.Related,
  [Relation.Duplicate]: Relation.Duplicate,
};
