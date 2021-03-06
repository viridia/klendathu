import { gql } from 'apollo-server-express';
import { Account } from './Account';
import { Commit } from './Commit';
import { Issue } from './Issue';
import { Label } from './Label';
import { Membership } from './Membership';
import { Mutation } from './Mutation';
import { Project } from './Project';
import { ProjectPrefs } from './ProjectPrefs';
import { Query } from './Query';
import { Timebox } from './Timebox';
import { Stats } from './Stats';
import { Subscription } from './Subscription';
import { Timeline } from './Timeline';
import { Webhook } from './Webhook';

export const Root = gql`
"Date and time"
scalar DateTime

"JSON object that has it's own schema"
scalar JSONObject

type DeletionResult {
  id: ID!
}
`;

export const typeDefs = [
  Account,
  Commit,
  Issue,
  Label,
  Membership,
  Mutation,
  Project,
  ProjectPrefs,
  Query,
  Stats,
  Subscription,
  Timebox,
  Timeline,
  Webhook,
  Root,
];
