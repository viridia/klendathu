export { Context } from './Context';
import * as accounts from './account';
import * as issueTypes from './issueTypes';
import * as issueMutations from './issueMutations';
import * as issueQueries from './issueQueries';
import * as issueSubscriptions from './issueSubscriptions';
import * as timeline from './timeline';
import * as labels from './labels';
import * as memberships from './memberships';
import * as projects from './projects';
import * as projectPrefs from './projectPrefs';
import * as templates from './template';

export const resolverMap = {
  Query: {
    ...accounts.queries,
    ...issueQueries.queries,
    ...labels.queries,
    ...projects.queries,
    ...projectPrefs.queries,
    ...templates.queries,
    ...timeline.queries,
  },
  Mutation: {
    ...accounts.mutations,
    ...issueMutations.mutations,
    ...labels.mutations,
    ...projects.mutations,
    ...projectPrefs.mutations,
    ...templates.mutations,
  },
  Subscription: {
    ...issueSubscriptions.subscriptions,
    ...labels.subscriptions,
    ...projects.subscriptions,
    ...projectPrefs.subscriptions,
  },
  ...accounts.types,
  ...issueTypes.types,
  ...labels.types,
  ...memberships.types,
  ...projects.types,
  ...projectPrefs.types,
  ...templates.types,
  ...timeline.types,
};
