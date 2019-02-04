import {
  ProjectRecord,
  MembershipRecord,
  AccountRecord,
  AugmentedProjectRecord,
} from '../db/types';
import {
  CreateProjectMutationArgs,
  ProjectQueryArgs,
  UpdateProjectMutationArgs,
  ProjectAddedSubscriptionArgs,
} from '../../../common/types/graphql';
import { Context } from './Context';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { pubsub } from './pubsub';
import { withFilter } from 'graphql-subscriptions';
import { getProjectRole } from '../db/role';

const PROJECT_ADDED = 'project-added';

interface ProjectJoinResult extends MembershipRecord {
  projectRecord: ProjectRecord[];
}

export const queries = {
  async project(_: any, args: ProjectQueryArgs, context: Context): Promise<AugmentedProjectRecord> {
    const user = context.user ? context.user.accountName : null;
    const projects = context.db.collection('projects');
    const query = args.id
        ? { _id: new ObjectID(args.id) }
        : { owner: args.owner, name: args.name };

    // Look up project
    const project = await projects.findOne<ProjectRecord>(query);
    if (!project) {
      logger.error('Attempt to fetch non-existent project:', { user, ...args });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    // Look up user membership
    const membership = context.user ? await context.db.collection('memberships')
        .findOne<MembershipRecord>({ user: context.user._id, project: project._id }) : null;
    let role = Role.NONE;
    if (membership) {
      // Set role.
      role = membership.role;
    } else if (!project.isPublic) {
      // If project is not public, then ensure that user is a member.
      logger.error('Attempt to access private project:', { user, ...args });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    return { ...project, role };
  },

  async projects(_: any, args: {}, context: Context): Promise<AugmentedProjectRecord[]> {
    if (!context.user) {
      return [];
    }
    const memberships = context.db.collection('memberships');
    // TODO: include organization matches
    const projectMemberships = await memberships.aggregate<ProjectJoinResult>([
      { $match: { user: context.user._id, project: { $exists: true } } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectRecord',
        }
      },
    ]).toArray();
    const result: AugmentedProjectRecord[] = [];
    for (const m of projectMemberships) {
      for (const pr of m.projectRecord) {
        result.push({ ...pr, role: m.role });
      }
    }
    // TODO: Sort
    // TODO: Eliminate dups.
    return result;
  },
};

export const mutations = {
  async createProject(
      _: any,
      { owner, name, input }: CreateProjectMutationArgs,
      context: Context): Promise<AugmentedProjectRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    // Lookup the owner name
    const accountRecord = await context.db.collection('accounts')
        .findOne<AccountRecord>({ _id: new ObjectID(owner) });
    if (!accountRecord) {
      logger.error(
          'Attempt to create project under non-existent name:',
          { user: context.user.accountName, owner });
      throw new UserInputError(Errors.INVALID_ACCOUNT);
    }

    // Make sure we are allowed to create a project
    if (accountRecord.type === 'USER') {
      if (!accountRecord._id.equals(context.user._id)) {
        logger.error(
            'You can only create projects for yourself.',
            { user: context.user.accountName, owner });
        throw new UserInputError(Errors.UNAUTHORIZED);
      }
    } else {
      // TODO: Check organization role.
      logger.error(
          'Creating projects for organizations not implemented yet:',
          { user: context.user.accountName, owner });
      throw new UserInputError(Errors.NOT_IMPLEMENTED);
    }

    if (!name || name.length < 1) {
      logger.error(
          'Project name is required.',
          { user: context.user.accountName, owner, name });
      throw new UserInputError(Errors.TEXT_MISSING, { field: 'name' });
    } else if (!name.match(/^[a-z][\w\-\.]*$/)) {
      logger.error(
          'Invalid project name.',
          { user: context.user.accountName, owner, name });
      throw new UserInputError(Errors.TEXT_INVALID_CHARS, { field: 'name' });
    }

    const projects = await context.db.collection('projects');
    const existing = await projects.findOne<ProjectRecord>({ owner: accountRecord._id, name });
    if (existing) {
      logger.error(
          'A project with that name already exists.',
          { user: context.user.accountName, owner, name });
      throw new UserInputError(Errors.CONFLICT, { field: 'name' });
    }

    const now = new Date();
    const record: ProjectRecord = {
      owner: accountRecord._id,
      ownerName: accountRecord.accountName,
      name,
      title: input.title,
      description: input.description,
      isPublic: input.isPublic,
      created: now,
      updated: now,
      template: null,
      issueIdCounter: 0,
      labelIdCounter: 0,
    };

    const result = await projects.insertOne(record);
    const projectId: ObjectID = result.insertedId;

    const memberships = context.db.collection('memberships');
    const membershipRecord: MembershipRecord = {
      user: context.user._id,
      project: projectId,
      role: Role.ADMINISTRATOR,
      created: now,
      updated: now,
    };

    await memberships.insertOne(membershipRecord);
    pubsub.publish(PROJECT_ADDED, {
      projectAdded: {
        _id: result.insertedId,
        ...record,
      },
    });

    return {
      _id: result.insertedId,
      role: membershipRecord.role,
      ...record,
    };
  },

  async updateProject(
      _: any,
      { id, input }: UpdateProjectMutationArgs,
      context: Context): Promise<ProjectRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    console.log('update project', id, input);
    return null;
  },
};

export const subscriptions = {
  projectAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([PROJECT_ADDED]),
      (
        { projectAdded }: { projectAdded: ProjectRecord },
        { owners }: ProjectAddedSubscriptionArgs,
        context: Context) => {
        // Anonymous users cannot subscribe to project additions.
        if (!context.user) {
          return false;
        }

        // Only listen to projects from specific owners.
        if (owners.findIndex(o => projectAdded.owner.equals(o)) < 0) {
          return false;
        }

        // Lookup membership
        return getProjectRole(context.db, context.user, projectAdded)
            .then(role => role !== Role.NONE);
      }
    ),
  },
};

export const types = {
  Project: {
    id: (pr: ProjectRecord) => pr._id.toHexString(),
    owner: (pr: ProjectRecord) => pr.owner.toHexString(),
    createdAt: (pr: ProjectRecord) => pr.created,
    updatedAt: (pr: ProjectRecord) => pr.updated,
  },
};
