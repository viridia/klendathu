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
import * as milestones from './milestones';
import * as projects from './projects';
import * as projectPrefs from './projectPrefs';
import * as templates from './template';
import * as webhooks from './webhooks';

export const resolverMap = {
  Query: {
    ...accounts.queries,
    ...commits.queries,
    ...issueQueries.queries,
    ...labels.queries,
    ...memberships.queries,
    ...milestones.queries,
    ...projects.queries,
    ...projectPrefs.queries,
    ...templates.queries,
    ...timeline.queries,
    ...webhooks.queries,
  },
  Mutation: {
    ...accounts.mutations,
    ...issueMutations.mutations,
    ...labels.mutations,
    ...memberships.mutations,
    ...milestones.mutations,
    ...projects.mutations,
    ...projectPrefs.mutations,
    ...templates.mutations,
    ...webhooks.mutations,
  },
  Subscription: {
    ...issueSubscriptions.subscriptions,
    ...labels.subscriptions,
    ...memberships.subscriptions,
    ...milestones.subscriptions,
    ...projects.subscriptions,
    ...projectPrefs.subscriptions,
  },
  ...accounts.types,
  ...commits.types,
  ...issueTypes.types,
  ...labels.types,
  ...memberships.types,
  ...milestones.types,
  ...projects.types,
  ...projectPrefs.types,
  ...templates.types,
  ...timeline.types,
  ...webhooks.types,
};
