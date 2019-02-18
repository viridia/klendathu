import { MongoClient } from 'mongodb';
import { logger } from '../logger';
import { ensureCollections } from './helpers';

// Connect to the database
export async function createClient(): Promise<MongoClient> {
  const dbUrl = process.env.DB_HOST;
  const client = await MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    auth: { user: process.env.DB_USER, password: process.env.DB_PASSWORD }
  });
  const db = client.db(process.env.DB_NAME);
  logger.debug(`Connected to ${dbUrl}`);
  await ensureCollections(db, [
    'accounts',
    'comments',
    'issues',
    'issueChanges',
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
