import { MongoClient } from 'mongodb';
import { logger } from '../logger';
import { ensureCollections } from './helpers';
import { readFileSync } from 'fs';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForConnection(): Promise<MongoClient> {
  logger.debug(`Connecting to ${process.env.DB_HOST}.`);
  const sslValidate = Boolean(process.env.DB_CA);
  const sslCA = sslValidate ? [readFileSync(process.env.DB_CA)] : [];
  try {
    const client = await MongoClient.connect(process.env.DB_HOST, {
      appname: 'Klendathu',
      useNewUrlParser: true,
      sslValidate,
      sslCA,
      auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
      numberOfRetries: 4,
      connectTimeoutMS: 1000,
      loggerLevel: 'debug',
    });
    logger.debug('Database connection successful.');
    return client;
  } catch (e) {
    logger.warn('Connection to MongoDB failed, retrying.');
    logger.error(e);
  }
  logger.error('Connection to MongoDB failed, aborting.');
  await sleep(100); // Give logger time to flush
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
    'projects',
    'projectPrefs',
    'templates',
    'timeboxes',
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
