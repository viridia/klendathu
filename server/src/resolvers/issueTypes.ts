import { Context } from './Context';
import { AccountRecord, IssueLinkRecord, IssueRecord } from '../db/types';
import { inverseRelations } from '../../../common/types/json';

export const types = {
  Issue: {
    id(row: IssueRecord) { return row._id; },
    ownerSort: (row: IssueRecord) => row.ownerSort ? row.ownerSort : null,
    createdAt: (row: IssueRecord) => row.created,
    updatedAt: (row: IssueRecord) => row.updated,
    custom(row: IssueRecord) {
      return Object.getOwnPropertyNames(row.custom).map(key => ({
        key,
        value: row.custom[key]
      }));
    },
    reporterAccount(row: IssueRecord, _: any, context: Context): Promise<AccountRecord> {
      return context.accounts.findOne({ _id: row.reporter });
    },
    ownerAccount(row: IssueRecord, _: any, context: Context): Promise<AccountRecord> {
      if (row.owner) {
        return context.accounts.findOne({ _id: row.owner });
      }
      return null;
    },
    async ccAccounts(row: IssueRecord, _: any, context: Context): Promise<AccountRecord[]> {
      if (row.cc && row.cc.length > 0) {
        return context.accounts.find({ _id: { $in: row.cc } }).toArray();
      }
      return [];
    },
    async links(row: IssueRecord, _: any, context: Context) {
      const links = await context.db.collection<IssueLinkRecord>('issueLinks').find({
        $or: [
          { from: row._id },
          { to: row._id },
        ]
      }).toArray();
      // Links that are from the specified issue are returned as-is; links that are
      // to the issue are returned with the inverse relation.
      return links.map(link => {
        if (link.from === row._id) {
          return link;
        }
        return {
          to: link.from,
          from: row._id,
          relation: inverseRelations[link.relation],
        };
      });
    },
  },
  CustomValue: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
  },
};
