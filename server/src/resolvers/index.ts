export { Context } from './Context';
import * as accounts from './account';
import * as issues from './issues';
import * as memberships from './memberships';
import * as projects from './projects';
import * as templates from './template';

export const resolverMap = {
  Query: {
    ...accounts.queries,
    ...issues.queries,
    ...projects.queries,
    ...templates.queries,
  },
  Mutation: {
    ...accounts.mutations,
    ...issues.mutations,
    ...projects.mutations,
    ...templates.mutations,
  },
  Subscription: {
    ...projects.subscriptions,
  },
  ...accounts.types,
  ...issues.types,
  ...memberships.types,
  ...projects.types,
  ...templates.types,
};
