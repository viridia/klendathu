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
  const result = await db.collection<AccountRecord>('accounts')
    .findOneAndUpdate({ accountName }, { $setOnInsert: account }, {
      upsert: true,
      returnOriginal: false,
    });
  return result.value;
}

export async function constructTestServer(): Promise<TestServer> {
  jest.setTimeout(30 * 1000);
  // Override the normal DB name and auth params. We don't want to accidentally damage the
  // real database because of a test!
  process.env.DB_NAME = 'klendathu-test';
  if (!process.env.DB_USER) {
    process.env.DB_USER = 'klendathu-admin';
  }
  if (!process.env.DB_PASSWORD) {
    process.env.DB_USER = 'example';
  }
  const client = await createClient();
  const db = client.db(process.env.DB_NAME);
  const dflores = await createTestUserAccount(db, 'dflores', 'Dizzy Flores');
  const kitten = await createTestUserAccount(db, 'kitten', '"Kitten" Smith');
  const blacky = await createTestUserAccount(db, 'blacky', 'Capt. Blackstone');
  const context = new Context(db, dflores);
  const apollo = new ApolloServer({
    typeDefs,
    context,
    resolvers: resolverMap,
  });
  const close = async () => {
    await apollo.stop();
    await client.close();
  };
  return { client, db, context, apollo, close, users: { dflores, kitten, blacky } };
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
