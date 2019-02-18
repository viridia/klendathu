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

export interface TestServer {
  apollo: ApolloServer;
  client: MongoClient;
  db: Db;
  context: Context;
  close: () => Promise<any>;
  users: { [name: string]: AccountRecord };
}

export async function createTestUserAccount(
    db: Db,
    accountName: string,
    display: string): Promise<AccountRecord> {
  const account: AccountRecord = {
    accountName,
    display,
    type: 'USER',
  };
  const result =
      await db.collection('accounts').findOneAndUpdate({ accountName }, { $setOnInsert: account }, {
    upsert: true,
  });
  logger.debug(JSON.stringify(result, null, 2));
  return result.value;
}

export async function constructTestServer(): Promise<TestServer> {
  process.env.DB_NAME = 'klendathu-test';
  process.env.DB_USER = 'klendathu-admin';
  process.env.DB_PASSWORD = 'example';
  const client = await createClient();
  const db = client.db(process.env.DB_NAME);
  const user = await createTestUserAccount(db, 'dflores', 'Dizzy Flores');
  const kitten = await createTestUserAccount(db, 'kitten', '"Kitten" Smith');
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
  return { client, db, context, apollo, close, users: { dflores: user, kitten } };
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

const savedLogLevel = logger.level;

export function disableErrorLog() {
  logger.level = 'silent';
}

export function restoreLogLevel() {
  logger.level = savedLogLevel;
}
