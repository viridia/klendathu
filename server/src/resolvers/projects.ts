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
  ProjectChangedSubscriptionArgs,
  RemoveProjectMutationArgs,
  ProjectsChangedSubscriptionArgs,
  ChangeAction,
  ProjectContextQueryArgs,
} from '../../../common/types/graphql';
import { Context } from './Context';
import { UserInputError, AuthenticationError } from 'apollo-server-core';
import { Errors, Role } from '../../../common/types/json';
import { logger } from '../logger';
import { ObjectID } from 'mongodb';
import { pubsub } from './pubsub';
import { withFilter } from 'graphql-subscriptions';
import { getProjectRole, getProjectAndRole } from '../db/role';

const software = require('../templates/software.json'); // tslint:disable-line

const PROJECT_CHANGE = 'project-change';

interface ProjectJoinResult extends MembershipRecord {
  projectRecord: ProjectRecord[];
}

interface ProjectRecordChange {
  project: ProjectRecord;
  action: ChangeAction;
}

interface ProjectAndAccount {
  project: AugmentedProjectRecord;
  account: AccountRecord;
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

  async projectContext(
      _: any,
      { owner, name }: ProjectContextQueryArgs,
      context: Context): Promise<ProjectAndAccount> {
    const user = context.user ? context.user.accountName : null;
    const account = await context.db.collection('accounts')
        .findOne<AccountRecord>({ accountName: owner });
    if (!account) {
      logger.error('Attempt to fetch non-existent account:', { user, owner });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    // Look up project
    const projects = context.db.collection('projects');
    const project = await projects.findOne<ProjectRecord>({ owner: account._id, name });
    if (!project) {
      logger.error('Attempt to fetch non-existent project:', { user, owner, name });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const role = await getProjectRole(context.db, context.user, project);
    if (role === Role.NONE) {
      logger.error('Attempt to access private project:', { user, owner, name });
      return null;
    }

    // const members = await context.db.collection('memberships').find<MembershipRecord>({
    //   project: project._id,
    // }).toArray();

    return {
      project: { ...project, role },
      account,
      // members,
    };
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

    const projects = context.db.collection('projects');
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
      issueIdCounter: 1,
      labelIdCounter: 1,
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
    pubsub.publish(PROJECT_CHANGE, {
      action: ChangeAction.Added,
      project: {
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

    const user = context.user.accountName;
    const { project, role } = await getProjectAndRole(context.db, context.user, new ObjectID(id));
    if (!project) {
      logger.error('Attempt to update non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to update project:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const update: Partial<ProjectRecord> = {};
    if ('title' in input) {
      update.title = input.title;
    }

    if ('description' in input) {
      update.description = input.description;
    }

    if ('isPublic' in input) {
      update.isPublic = input.isPublic;
    }

    const result = await context.db.collection('projects')
        .updateOne({ _id: project._id }, { $set: update });

    if (result.modifiedCount === 1) {
      const updatedProject = { ...project, ...update };
      pubsub.publish(PROJECT_CHANGE, {
        action: ChangeAction.Changed,
        project: updatedProject,
      });
      return updatedProject;
    }

    logger.error('Internal error updating project:', { user, id, update });
    throw new UserInputError(Errors.INTERNAL);
  },

  async removeProject(
      _: any,
      { id }: RemoveProjectMutationArgs,
      context: Context): Promise<{ id: ObjectID }> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project, role } = await getProjectAndRole(context.db, context.user, new ObjectID(id));
    if (!project) {
      logger.error('Attempt to delete non-existent project:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to delete project:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const result = await context.db.collection('projects').deleteOne({ _id: project._id });
    if (result.deletedCount === 1) {
      await Promise.all([
        context.db.collection('issues').deleteMany({ project: project._id }),
        context.db.collection('labels').deleteMany({ project: project._id }),
        context.db.collection('issueLinks').deleteMany({ project: project._id }),
        context.db.collection('issueChanges').deleteMany({ project: project._id }),
        context.db.collection('memberships').deleteMany({ project: project._id }),
        context.db.collection('projectPrefs').deleteMany({ project: project._id }),
      ]);
      pubsub.publish(PROJECT_CHANGE, { action: ChangeAction.Removed, project });
      return { id: project._id };
    }

    logger.error('Internal error deleting project:', { user, id });
    throw new UserInputError(Errors.INTERNAL);
  },
};

export const subscriptions = {
  projectsChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([PROJECT_CHANGE]),
      (
        { project }: ProjectRecordChange,
        { owners }: ProjectsChangedSubscriptionArgs,
        context: Context) => {
        // Anonymous users cannot subscribe to project additions.
        if (!context.user) {
          return false;
        }

        // Only listen to projects from specific owners.
        if (owners.findIndex(o => project.owner.equals(o)) < 0) {
          return false;
        }

        // Lookup membership
        return getProjectRole(context.db, context.user, project)
            .then(role => role !== Role.NONE);
      }
    ),
    resolve: (payload: ProjectRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
  projectChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([PROJECT_CHANGE]),
      (
        { project }: ProjectRecordChange,
        { project: id }: ProjectChangedSubscriptionArgs,
        context: Context) => {

        if (!project._id.equals(id)) {
          return false;
        }

        // Project must be visible
        return getProjectRole(context.db, context.user, project)
            .then(role => role !== Role.NONE);
      }
    ),
    resolve: (payload: ProjectRecordChange, args: any, context: Context) => {
      return payload;
    },
  },
};

export const types = {
  Project: {
    id: (pr: ProjectRecord) => pr._id.toHexString(),
    owner: (pr: ProjectRecord) => pr.owner.toHexString(),
    createdAt: (pr: ProjectRecord) => pr.created,
    updatedAt: (pr: ProjectRecord) => pr.updated,
  },
  ProjectContext: {
    template: async (pc: ProjectAndAccount) => {
      if (pc.project.template) {
        throw new UserInputError(Errors.NOT_IMPLEMENTED);
      }
      return software;
    }
  }
};
