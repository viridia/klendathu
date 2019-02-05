import { gql } from 'apollo-server-express';
import { Account } from './Account';
import { Membership } from './Membership';
import { Mutation } from './Mutation';
import { Project } from './Project';
import { Query } from './Query';
import { Subscription } from './Subscription';

export const Root = gql`
scalar DateTime

type DeletionResult {
  id: ID!
}
`;

export const typeDefs = [
  Account,
  Membership,
  Mutation,
  Project,
  Query,
  Subscription,
  Root,
];
