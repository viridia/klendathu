import { FilterTermDescriptor } from './FilterTermDescriptor';
import { Predicate } from '../../../common/types/graphql';

export interface FilterTerm {
  descriptor: FilterTermDescriptor;
  fieldId: string;
  value: any;
  predicate?: Predicate;
}
