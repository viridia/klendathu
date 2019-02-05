export { Context } from './Context';
import * as accounts from './account';
import * as memberships from './memberships';
import * as projects from './projects';

export const resolverMap = {
  Query: {
    ...accounts.queries,
    ...projects.queries,
  },
  Mutation: {
    ...accounts.mutations,
    ...projects.mutations,
  },
  Subscription: {
    ...projects.subscriptions,
  },
  ...accounts.types,
  ...memberships.types,
  ...projects.types,
};
