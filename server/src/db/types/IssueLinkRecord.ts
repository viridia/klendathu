import { Relation } from 'klendathu-json-types';
import { ObjectID } from 'mongodb';

export interface IssueLinkRecord {
  _id?: ObjectID;
  from: string;
  to: string;
  relation: Relation;
}
