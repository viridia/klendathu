import { Db } from 'mongodb';
import { logger } from '../logger';

export async function ensureCollections(db: Db, names: string[]) {
  const collections = await db.listCollections().toArray();
  const promises: Array<Promise<any>> = [];
  for (const name of names) {
    if (collections.findIndex(collection => collection.name === name) < 0) {
      logger.debug(`Creating database collection: ${name}`);
      promises.push(db.createCollection(name));
    }
  }
  await Promise.all(promises);
}

export function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
