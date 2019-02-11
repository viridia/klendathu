import '../src/env';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from '../src/schema';
import { createTestClient } from 'apollo-server-testing';
import { resolverMap, Context } from '../src/resolvers';
import { MongoClient, Db } from 'mongodb';
import { createClient } from '../src/db/client';
import { logger } from '../src/logger';
import { AccountRecord } from '../src/db/types';
import { gql } from 'apollo-server-core';

logger.level = 'warn';

export interface TestServer {
  apollo: ApolloServer;
  client: MongoClient;
  db: Db;
  context: Context;
  close: () => Promise<any>;
}

export async function createTestUserAccount(
    db: Db,
    accountName: string,
    display: string): Promise<AccountRecord> {
  const result = await db.collection('accounts').insertOne({
    accountName,
    display,
    type: 'USER',
  });
  return result.ops[0];
}

export async function constructTestServer(): Promise<TestServer> {
  process.env.DB_NAME = 'klendathu-test';
  const client = await createClient();
  const db = client.db(process.env.DB_NAME);
  const user = await createTestUserAccount(db, 'dflores', 'Dizzy Flores');
  const context: Context = { client, db, user };
  const apollo = new ApolloServer({
    typeDefs,
    context,
    resolvers: resolverMap,
  });
  const close = async () => {
    await apollo.stop();
    await client.close();
  };
  return { client, db, context, apollo, close };
}

const CreateProjectMutation = gql`mutation CreateProjectMutation(
  $owner: ID!,
  $name: String!,
  $input: ProjectInput!)
{
  createProject(owner: $owner, name: $name, input: $input) { id name title }
}`;

export async function createTestProject(server: TestServer): Promise<string> {
  const { mutate } = createTestClient(server.apollo);
  const res = await mutate({
    mutation: CreateProjectMutation,
    variables: {
      owner: server.context.user._id.toHexString(),
      name: 'test-project',
      input: {
        title: 'Test Project',
        description: 'A test project',
        isPublic: false,
      }
    },
  });
  return res.data.createProject.id;
}

export function disableErrorLog() {
  logger.level = 'silent';
}

export function restoreLogLevel() {
  logger.level = 'warn';
}
