export { Context } from './Context';
import * as accounts from './account';
import * as commits from './commits';
import * as issueTypes from './issueTypes';
import * as issueMutations from './issueMutations';
import * as issueQueries from './issueQueries';
import * as issueSubscriptions from './issueSubscriptions';
import * as timeline from './timeline';
import * as labels from './labels';
import * as memberships from './memberships';
import * as timeboxes from './timeboxes';
import * as projects from './projects';
import * as projectPrefs from './projectPrefs';
import * as stats from './stats';
import * as templates from './template';
import * as webhooks from './webhooks';

export const resolverMap = {
  Query: {
    ...accounts.queries,
    ...commits.queries,
    ...issueQueries.queries,
    ...labels.queries,
    ...memberships.queries,
    ...projects.queries,
    ...projectPrefs.queries,
    ...stats.queries,
    ...templates.queries,
    ...timeboxes.queries,
    ...timeline.queries,
    ...webhooks.queries,
  },
  Mutation: {
    ...accounts.mutations,
    ...issueMutations.mutations,
    ...labels.mutations,
    ...memberships.mutations,
    ...projects.mutations,
    ...projectPrefs.mutations,
    ...templates.mutations,
    ...timeboxes.mutations,
    ...webhooks.mutations,
  },
  Subscription: {
    ...issueSubscriptions.subscriptions,
    ...labels.subscriptions,
    ...memberships.subscriptions,
    ...projects.subscriptions,
    ...projectPrefs.subscriptions,
    ...timeboxes.subscriptions,
  },
  ...accounts.types,
  ...commits.types,
  ...issueTypes.types,
  ...labels.types,
  ...memberships.types,
  ...projects.types,
  ...projectPrefs.types,
  ...stats.types,
  ...templates.types,
  ...timeboxes.types,
  ...timeline.types,
  ...webhooks.types,
};
