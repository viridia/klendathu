import { gql } from 'apollo-server-express';
import { Account } from './Account';
import { Issue } from './Issue';
import { Membership } from './Membership';
import { Milestone } from './Milestone';
import { Mutation } from './Mutation';
import { Project } from './Project';
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
  Membership,
  Milestone,
  Mutation,
  Project,
  Query,
  Subscription,
  Root,
];
