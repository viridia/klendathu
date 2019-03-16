import { Predicate } from '../../../common/types/graphql';
import { escapeRegExp } from '../db/helpers';
import { logger } from '../logger';

export interface PaginatedResult<T> {
  count: number;
  offset: number;
  results: T[];
}

export function stringPredicate(pred: Predicate, value: string): any {
  switch (pred) {
    case Predicate.In:
    case Predicate.Contains:
      return { $regex: escapeRegExp(value), $options: 'i' };
    case Predicate.Equals:
      return value;
    case Predicate.NotIn:
    case Predicate.NotContains:
      return { $not: new RegExp(escapeRegExp(value), 'i') };
    case Predicate.NotEquals:
      return { $ne: value };
    case Predicate.StartsWith:
      return { $regex: `^${escapeRegExp(value)}`, $options: 'i' };
    case Predicate.EndsWith:
      return { $regex: `${escapeRegExp(value)}$`, $options: 'i' };
    default:
      logger.error('Invalid string predicate:', pred);
      return null;
  }
}
