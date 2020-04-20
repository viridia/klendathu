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
import { Channels, RecordChange, publish, getPubSub } from './pubsub';
import { withFilter } from 'graphql-subscriptions';
import { getProjectRole, getProjectAndRole } from '../db/role';

const software = require('../templates/software.json'); // eslint-disable-line

type ProjectRecordChange = RecordChange<ProjectRecord>;

interface ProjectJoinResult extends MembershipRecord {
  projectRecord: ProjectRecord[];
}

interface ProjectAndAccount {
  project: AugmentedProjectRecord;
  account: AccountRecord;
}

export const queries = {
  async project(_: any, args: ProjectQueryArgs, context: Context): Promise<AugmentedProjectRecord> {
    const user = context.user ? context.user.accountName : null;
    const query = args.id
        ? { _id: new ObjectID(args.id) }
        : { owner: args.owner, name: args.name };

    // Look up project
    const project = await context.projects.findOne<ProjectRecord>(query);
    if (!project) {
      logger.error('Attempt to fetch non-existent project:', { user, ...args });
      throw new UserInputError(Errors.NOT_FOUND, { object: 'project' });
    }

    // Look up user membership
    const membership = context.user ? await context.memberships
      .findOne({ user: context.user._id, project: project._id }) : null;
    let role = Role.NONE;
    if (membership) {
      // Set role.
      role = membership.role;
    } else if (!project.isPublic) {
      // If project is not public, then ensure that user is a member.
      logger.error('Attempt to access private project:', { user, ...args });
      throw new UserInputError(Errors.NOT_FOUND, { object: 'project' });
    }

    return { ...project, role };
  },

  async projects(_: any, args: {}, context: Context): Promise<AugmentedProjectRecord[]> {
    if (!context.user) {
      return [];
    }
    // TODO: include organization matches
    const projectMemberships = await context.memberships.aggregate<ProjectJoinResult>([
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
    const account = await context.accounts.findOne({ accountName: owner });
    if (!account) {
      logger.error('Attempt to fetch non-existent account:', { user, owner });
      throw new UserInputError(Errors.NOT_FOUND, { object: 'account' });
    }

    // Look up project
    const project = await context.projects.findOne({ owner: account._id, name });
    if (!project) {
      logger.error('Attempt to fetch non-existent project:', { user, owner, name });
      throw new UserInputError(Errors.NOT_FOUND, { object: 'project' });
    }

    const role = await getProjectRole(context.db, context.user, project);
    if (role === Role.NONE) {
      logger.error('Attempt to access private project:', { user, owner, name });
      return null;
    }

    // const members = await context.memberships.find<MembershipRecord>({
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
    const accountRecord = await context.accounts.findOne({ _id: new ObjectID(owner) });
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

    const existing = await context.projects.findOne({ owner: accountRecord._id, name });
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

    const result = await context.projects.insertOne(record);
    const projectId: ObjectID = result.insertedId;
    const membershipRecord: MembershipRecord = {
      user: context.user._id,
      project: projectId,
      role: Role.ADMINISTRATOR,
      created: now,
      updated: now,
    };

    await context.memberships.insertOne(membershipRecord);
    publish(Channels.PROJECT_CHANGE, {
      action: ChangeAction.Added,
      value: {
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
      throw new UserInputError(Errors.NOT_FOUND, { object: 'project' });
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to update project:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN, { object: 'project' });
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

    const result = await context.projects.updateOne({ _id: project._id }, { $set: update });

    if (result.modifiedCount === 1) {
      const updatedProject = { ...project, ...update };
      publish(Channels.PROJECT_CHANGE, {
        action: ChangeAction.Changed,
        value: updatedProject,
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
      throw new UserInputError(Errors.NOT_FOUND, { object: 'project' });
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to delete project:', { user, id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const result = await context.projects.deleteOne({ _id: project._id });
    if (result.deletedCount === 1) {
      await Promise.all([
        context.issues.deleteMany({ project: project._id }),
        context.labels.deleteMany({ project: project._id }),
        context.db.collection('issueLinks').deleteMany({ project: project._id }),
        context.timeline.deleteMany({ project: project._id }),
        context.memberships.deleteMany({ project: project._id }),
        context.projectPrefs.deleteMany({ project: project._id }),
      ]);
      publish(Channels.PROJECT_CHANGE, { action: ChangeAction.Removed, value: project });
      return { id: project._id };
    }

    logger.error('Internal error deleting project:', { user, id });
    throw new UserInputError(Errors.INTERNAL);
  },
};

export const subscriptions = {
  projectsChanged: {
    subscribe: withFilter(
      () => getPubSub().asyncIterator([Channels.PROJECT_CHANGE]),
      (
        { value: project }: ProjectRecordChange,
        { owners }: ProjectsChangedSubscriptionArgs,
        context: Context
      ) => {
        // Anonymous users cannot subscribe to project additions.
        if (!context.user) {
          return false;
        }

        // Only listen to projects from specific owners.
        const owner = new ObjectID(project.owner);
        if (owners.findIndex(o => owner.equals(o)) < 0) {
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
      () => getPubSub().asyncIterator([Channels.PROJECT_CHANGE]),
      (
        { value: project }: ProjectRecordChange,
        { project: id }: ProjectChangedSubscriptionArgs,
        context: Context
      ) => {
        // console.log('project changed');
        if (!new ObjectID(project._id).equals(id)) {
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
    id: (row: ProjectRecord) => row._id,
    createdAt: (row: ProjectRecord) => row.created,
    updatedAt: (row: ProjectRecord) => row.updated,
  },
  ProjectContext: {
    template: async (pc: ProjectAndAccount) => {
      if (pc.project.template) {
        throw new UserInputError(Errors.NOT_IMPLEMENTED);
      }
      return software;
    },
    prefs: async (pc: ProjectAndAccount, args: any, context: Context) => {
      const project = pc.project._id;
      if (!context.user) {
        return {
          user: null,
          project,
        };
      }
      const prefs = await context.projectPrefs.findOne({ user: context.user._id, project });
      if (!prefs) {
        return {
          user: context.user._id,
          project,
        };
      }
      return prefs;
    },
    timeboxes: async (pc: ProjectAndAccount, args: any, context: Context) => {
      return context.timeboxes.find({ project: pc.project._id }).sort({ startDate: 1 }).toArray();
    }
  }
};
