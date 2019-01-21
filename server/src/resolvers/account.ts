// import { escapeRegExp } from '../db/helpers';
import { AccountRecord } from '../db/types';
import { Context } from './Context';
import { AccountQuery_account } from '../../../common/types/gql/AccountQuery';
import { externalize } from '../db/helpers';

// User profile query
export const queries = {
  account(
      _: any,
      args: { accountName: string, id: string },
      context: Context): Promise<AccountQuery_account> {
    console.log(args);
    const accounts = context.db.collection('accounts');
    if (args.accountName) {
      return accounts.findOne({ accountName: args.accountName }).then(externalize);
    } else if (args.id) {
      return accounts.findOne({ _id: args.id }).then(externalize);
    }
  },

  accounts(_: any, args: { token: string, project?: string }, context: Context):
      Promise<AccountRecord[]> {
    // TODO: get project role?
    // Can you list members of a non-public project that you are not a member of?
    // Probably not I guess...
    console.log(args);
    if (!context.user) {
      return null;
    }
    return Promise.resolve([]);
    // let query: r.Sequence = r.table('users');
    // if (args.token) {
    //   const pattern = `(?i)\\b${escapeRegExp(args.token)}`;
    //   query = query.filter((user: any) => {
    //     return user('fullname').match(pattern) || user('id').match(pattern);
    //   });
    // }
    // return query.orderBy(r.asc('fullname')).run(context.conn).then(cursor => cursor.toArray());
  },
};

// export const types = {
//   User: {
//     username(user: UserRecord) { return user.id; },
//   },
// };
