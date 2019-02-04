import * as jwt from 'jwt-simple';
import { Db, ObjectID } from 'mongodb';
import { AccountRecord } from './types';

export async function lookupUser(db: Db, uid: string): Promise<AccountRecord> {
  const account = await db.collection('accounts')
      .findOne<AccountRecord>({ _id: new ObjectID(uid) });
  return account ? { ...account, password: undefined } : null;
}

export async function decodeAuthToken(db: Db, token: string): Promise<AccountRecord> {
  const payload = jwt.decode(token, process.env.JWT_SECRET);
  return lookupUser(db, payload.uid);
}
