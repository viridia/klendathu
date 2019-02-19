import { MongoClient } from 'mongodb';
import { logger } from '../logger';
import { ensureCollections } from './helpers';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForConnection(): Promise<MongoClient> {
  logger.debug(`Connection to MongoDB at ${process.env.DB_HOST}.`);
  let retries = 0;
  while (retries < 10) {
    try {
      return await MongoClient.connect(process.env.DB_HOST, {
        useNewUrlParser: true,
        auth: { user: process.env.DB_USER, password: process.env.DB_PASSWORD }
      });
    } catch (e) {
      retries += 1;
      logger.warn('Connection to MongoDB failed, retrying.');
      await sleep(1000);
    }
  }
  logger.warn(`Connection to MongoDB failed after ${retries} attempts, aborting.`);
  process.exit(-1);
}

// Connect to the database
export async function createClient(): Promise<MongoClient> {
  const dbUrl = process.env.DB_HOST;
  const client = await waitForConnection();
  const db = client.db(process.env.DB_NAME);
  logger.info(`Connected to ${dbUrl}`);
  await ensureCollections(db, [
    'accounts',
    'issues',
    'timeline',
    'issueLinks',
    'labels',
    'memberships',
    'milestones',
    'projects',
    'projectPrefs',
    'templates',
  ]);
  return client;
}
