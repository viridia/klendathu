import { MongoClient, Db } from 'mongodb';

export interface Context {
  client: MongoClient;
  db: Db;
  user?: string;
}
