import { gql } from 'apollo-server-express';
import { Account } from './Account';
import { Issue } from './Issue';
import { Label } from './Label';
import { Membership } from './Membership';
import { Milestone } from './Milestone';
import { Mutation } from './Mutation';
import { Project } from './Project';
import { ProjectPrefs } from './ProjectPrefs';
import { Query } from './Query';
import { Subscription } from './Subscription';

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
  Issue,
  Label,
  Membership,
  Milestone,
  Mutation,
  Project,
  ProjectPrefs,
  Query,
  Subscription,
  Root,
];
