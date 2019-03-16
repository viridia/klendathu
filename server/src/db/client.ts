import { MongoClient } from 'mongodb';
import { logger } from '../logger';
import { ensureCollections } from './helpers';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForConnection(): Promise<MongoClient> {
  logger.debug(`Connecting to ${process.env.DB_HOST}.`);
  let retries = 0;
  let error: any = null;
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
    'commits',
    'issues',
    'issueLinks',
    'labels',
    'memberships',
    'milestones',
    'projects',
    'projectPrefs',
    'templates',
    'timeline',
    'webhooks',
  ]);
  db.collection('accounts').createIndex({ accountName: 1 });
  db.collection('commits').createIndex({ url: 1 });
  db.collection('issues').createIndex({ type: 1 });
  db.collection('issues').createIndex({ state: 1 });
  db.collection('issues').createIndex({ owner: 1 });
  db.collection('issues').createIndex({ ownerSort: 1 });
  db.collection('issues').createIndex({ reporter: 1 });
  db.collection('issues').createIndex({ reporterSort: 1 });
  db.collection('issues').createIndex({ created: 1 });
  db.collection('issues').createIndex({ update: 1 });
  db.collection('issueLinks').createIndex({ from: 1 });
  db.collection('issueLinks').createIndex({ to: 1 });
  db.collection('labels').createIndex({ project: 1 });
  return client;
}
