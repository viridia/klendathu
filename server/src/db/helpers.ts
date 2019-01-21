import { Db, ObjectID } from 'mongodb';
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

// export function ensureIndices(db: Db, indices: { [key: string]: string[] }) {
//   const promises: any[] = [];
//   for (const collectionName of Object.getOwnPropertyNames(indices)) {
//     const indexName = indices(collectionName);
//     const collection = db.collection(collectionName);
//     const index = await db.indexInformation()
//     db.collection('collectionName').createIndex()
//     promises.push(db.ensureIndex(tableName).indexList().run(conn).then(existing => {
//       const p: any[] = [];
//       for (const indexName of indices[tableName]) {
//         if (existing.indexOf(indexName) < 0) {
//           p.push(db.table(tableName).indexCreate(indexName).run(conn));
//         }
//       }
//       return Promise.all(p);
//     }));
//   }
//   return Promise.all(promises);
// }

export function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

export interface BaseRecord {
  _id: ObjectID;
}

/** Convert the '_id' field to 'id', and leave all other fields alone. */
export function externalize<T extends BaseRecord>(record: T):
    T & { id: string, __typename: any } {
  return record ? { id: record._id.toHexString(), ...record } as any : null;
}
