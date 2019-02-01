export { Context } from './Context';
import * as account from './account';

export const resolverMap = {
  Query: {
    ...account.queries,
  },
  Mutation: {
    ...account.mutations,
  },
  ...account.types,
};
