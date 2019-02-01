import { MongoClient, Db } from 'mongodb';
import { AccountRecord } from '../db/types';

export interface Context {
  client: MongoClient;
  db: Db;
  user?: AccountRecord;
}
