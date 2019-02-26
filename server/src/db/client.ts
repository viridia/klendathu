import { MongoClient } from 'mongodb';
import { logger } from '../logger';
import { ensureCollections } from './helpers';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForConnection(): Promise<MongoClient> {
  logger.debug(`Connection to MongoDB at ${process.env.DB_HOST}.`);
  let retries = 0;
  let error: any = null;
  // logger.debug(`DB_NAME ${process.env.DB_HOST}`);
  // logger.debug(`DB_USER ${process.env.DB_USER}`);
  // logger.debug(`DB_PASSWORD ${process.env.DB_PASSWORD}`);
  while (retries < 4) {
    try {
      return await MongoClient.connect(process.env.DB_HOST, {
        useNewUrlParser: true,
        auth: { user: process.env.DB_USER, password: process.env.DB_PASSWORD }
      });
    } catch (e) {
      error = e;
      retries += 1;
      logger.warn('Connection to MongoDB failed, retrying.');
      await sleep(2000);
    }
  }
  logger.error(`Connection to MongoDB failed after ${retries} attempts, aborting.`);
  logger.error(error);
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
  db.collection('issues').createIndex({ type: 1 });
  db.collection('issues').createIndex({ state: 1 });
  db.collection('issues').createIndex({ ownerSort: 1 });
  db.collection('issues').createIndex({ reporterSort: 1 });
  db.collection('issues').createIndex({ created: 1 });
  db.collection('issues').createIndex({ update: 1 });
  return client;
}
