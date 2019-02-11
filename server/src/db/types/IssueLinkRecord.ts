import { ObjectID } from 'mongodb';
import { Relation } from '../../../../common/types/graphql';

export interface IssueLinkRecord {
  _id?: ObjectID;
  from: string;
  to: string;
  relation: Relation;
}
