import { Relation } from 'klendathu-json-types';
import { ObjectID } from 'bson';

export interface IssueLinkRecord {
  _id?: ObjectID;
  from: string;
  to: string;
  relation: Relation;
}
