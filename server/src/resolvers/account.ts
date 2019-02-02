import { AccountRecord } from '../db/types';
import { Context } from './Context';
import {
  AccountQueryArgs,
  AccountsQueryArgs,
  CreateUserAccountMutationArgs,
  UpdateAccountMutationArgs,
} from '../../../common/types/graphql';
import { escapeRegExp } from '../db/helpers';
import { ObjectID } from 'bson';
import { AuthenticationError, UserInputError } from 'apollo-server-core';
import { Errors } from '../../../common/types/json';

// User profile query
export const queries = {
  account(_: any, args: AccountQueryArgs, context: Context): Promise<AccountRecord> {
    const accounts = context.db.collection('accounts');
    if (args.accountName) {
      return accounts.findOne({ accountName: args.accountName });
    } else if (args.id) {
      return accounts.findOne({ _id: new ObjectID(args.id) });
    }
  },

  async accounts(_: any, args: AccountsQueryArgs, context: Context): Promise<AccountRecord[]> {
    // TODO: get project role?
    const accounts = context.db.collection('accounts');
    const query: any = {};
    if (args.token) {
      // Empty token matches nothing
      if (args.token === '') {
        return [];
      }
      const pattern = `(?i)\\b${escapeRegExp(args.token)}`;
      query.$or = [
        { accountName: { $regex: pattern, $options: 'i' }},
        { display: { $regex: pattern, $options: 'i' }},
        { email: args.token }, // Email address must be exact.
      ];
    }
    if (args.type) {
      query.type = args.type;
    }
    return accounts.find(query).sort({ display: 1, accountName: 1 }).toArray();
  },

  // Information about the current user.
  me(_: any, args: {}, context: Context): AccountRecord {
    return context.user;
  },
};

export const mutations = {
  async createUserAccount(
      _: any,
      { input }: CreateUserAccountMutationArgs,
      context: Context): Promise<AccountRecord> {
    console.log('create account', input);
    return null;
  },

  async updateAccount(
      _: any,
      { input }: UpdateAccountMutationArgs,
      context: Context): Promise<AccountRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    } else if (!input.accountName) {
      throw new UserInputError(Errors.TEXT_MISSING, { field: 'accountName' });
    } else if (input.accountName.length < 4) {
      throw new UserInputError(Errors.TEXT_TOO_SHORT, { field: 'accountName' });
    } else if (input.accountName.toLowerCase() !== input.accountName) {
      throw new UserInputError(Errors.USERNAME_LOWER_CASE);
    } else if (!input.accountName.match(/^[a-z][a-z0-9_\-]+$/)) {
      throw new UserInputError(Errors.TEXT_INVALID_CHARS, { field: 'accountName' });
    } else if (!input.display) {
      throw new UserInputError(Errors.TEXT_MISSING, { field: 'display' });
    } else if (input.display.length < 4) {
      throw new UserInputError(Errors.TEXT_TOO_SHORT, { field: 'display' });
    }

    // TODO: Uhhhh...permissions?

    const accounts = context.db.collection('accounts');
    const account =
        await accounts.findOne<AccountRecord>({ accountName: input.accountName });
    if (account && account._id !== context.user._id) {
      // Duplicate name
      throw new UserInputError(Errors.CONFLICT, { field: 'accountName' });
    } else {
      // Update the database
      const result = await accounts.updateOne(
        { _id: context.user._id },
        { $set: { display: input.display, accountName: input.accountName }});
      if (result.modifiedCount === 1) {
        return {
          ...context.user,
          display: input.display,
          accountName: input.accountName,
        };
      }
    }
    return null;
  },
};

export const types = {
  Account: {
    id(acc: AccountRecord) { return acc._id; },
    display(acc: AccountRecord) { return acc.display || ''; },
  },
  PublicAccount: {
    id(acc: AccountRecord) { return acc._id; },
    display(acc: AccountRecord) { return acc.display || ''; },
  },
};
