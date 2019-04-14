import { MembershipRecord } from '../db/types';
import {
  ProjectMembersQueryArgs,
  SetProjectRoleMutationArgs,
  RemoveProjectMemberMutationArgs,
  AccountType,
  ChangeAction,
  MembershipChangedSubscriptionArgs,
} from '../../../common/types/graphql';
import { Context } from './Context';
import { ObjectID } from 'mongodb';
import { Errors, Role } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { AuthenticationError, UserInputError } from 'apollo-server-core';
import { withFilter } from 'graphql-subscriptions';
import { Channels, publish, getPubSub } from './pubsub';

interface MembershipRecordChange {
  value: MembershipRecord;
  action: ChangeAction;
}

export const queries = {
  async projectMembers(
      _: any,
      { project }: ProjectMembersQueryArgs,
      context: Context): Promise<MembershipRecord[]> {
    const query: any = { project: new ObjectID(project) };
    return context.memberships.find(query).toArray();
  },
};

export const mutations = {
  async setProjectRole(
      _: any,
      { project, account, role: newRole }: SetProjectRoleMutationArgs,
      context: Context): Promise<MembershipRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project: pr, role } =
      await getProjectAndRole(context.db, context.user, new ObjectID(project));
    if (!pr) {
      logger.error('Attempt to add member to non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER || role < newRole) {
      logger.error('Insufficient permissions to add project member:', { user, project });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const acc = await context.accounts.findOne({ _id: new ObjectID(account) });
    if (!acc) {
      logger.error('Attempt to add non-existent member to project:', { user, account, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (acc.type !== AccountType.User) {
      logger.error('Attempt to add non-user member to project:', { user, account, project });
      throw new UserInputError(Errors.INVALID_ACCOUNT);
    }

    const now = new Date();
    const m = await context.memberships.findOne({ project: pr._id, user: acc._id });
    if (m) {
      if (role < m.role) {
        logger.error('Cannot set access for higher-ranked project member:', { user, project });
        throw new UserInputError(Errors.FORBIDDEN);
      }

      const result = await context.memberships.findOneAndUpdate(
        { project: pr._id, user: acc._id },
        { $set: { role: newRole, updated: now }},
        { returnOriginal: false });
      publish(Channels.MEMBERSHIP_CHANGE, {
        action: ChangeAction.Changed,
        value: result.value,
      });
      return result.value;
    } else {
      const record: MembershipRecord = {
        project: pr._id,
        user: acc._id,
        role: newRole,
        created: now,
        updated: now,
      };
      const result = await context.memberships.insertOne(record);
      publish(Channels.MEMBERSHIP_CHANGE, {
        action: ChangeAction.Added,
        value: result.ops[0],
      });
      return result.ops[0];
    }
  },

  async removeProjectMember(
      _: any,
      { project, account }: RemoveProjectMemberMutationArgs,
      context: Context): Promise<MembershipRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;

    const { project: pr, role } = await getProjectAndRole(
      context.db, context.user, new ObjectID(project));
    if (!pr) {
      logger.error('Attempt to remove member for non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const membership =
        await context.memberships.findOne({ user: new ObjectID(account), project: pr._id });
    if (!membership) {
      logger.error(
        'Attempt to remove non-existent project membership:', { user, project, account });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER || role < membership.role) {
      logger.error('Insufficient permissions to remove member:', { user, project, account });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const result = await context.memberships.findOneAndDelete(
      { project: pr._id, user: membership.user });
    publish(Channels.MEMBERSHIP_CHANGE, {
      action: ChangeAction.Removed,
      value: result.value,
    });
    return result.value;
  },
};

export const subscriptions = {
  membershipChanged: {
    subscribe: withFilter(
      () => getPubSub().asyncIterator([Channels.MEMBERSHIP_CHANGE]),
      (
        { value }: MembershipRecordChange,
        { project: id }: MembershipChangedSubscriptionArgs,
        context: Context) => {
        return context.user && new ObjectID(value.project).equals(id);
      }
    ),
    resolve: (payload: MembershipRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
};

export const types = {
  Membership: {
    id: (m: MembershipRecord) => m._id,
    createdAt: (m: MembershipRecord) => m.created,
    updatedAt: (m: MembershipRecord) => m.updated,
  },
};
