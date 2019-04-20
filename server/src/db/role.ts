import { AccountRecord, ProjectRecord, MembershipRecord } from './types';
import { Role } from '../../../common/types/json';
import { Db, ObjectID } from 'mongodb';
import { logger } from '../logger';
import { server } from '../Server';

export async function getProjectRole(
    db: Db, user: AccountRecord, project: ProjectRecord): Promise<number> {
  if (!project) {
    return Role.NONE;
  }

  if (!user) {
    return project.isPublic ? Role.VIEWER : Role.NONE;
  }

  // Lookup either membership in the project, or membership in the organization that owns
  // the project. Note that if the project is owned by a user, then there should be
  // no organization with the owner's id.
  try {
    const memberships = await db.collection('memberships').find<MembershipRecord>({
      user: user._id,
      $or: [
        { organization: project.owner },
        { project: project._id },
      ]
    }).toArray();

    // Return whichever role is higher.
    return Math.max(...memberships.map(m => m.role));
  } catch (e) {
    logger.error('Error looking up project role', { user: user.accountName, project: project._id });
    return 0;
  }
}

export async function getProjectAndRole(
    db: Db,
    user: AccountRecord,
    projectId: ObjectID): Promise<{ project?: ProjectRecord; role: Role }> {
  const projects = db.collection('projects');
  const project = await projects.findOne<ProjectRecord>({ _id: projectId });
  if (project) {
    const role = await getProjectRole(db, user, project);
    return { project, role };
  }
  return { role: Role.NONE };
}

/** Looks up the user's role from the redis cache. */
export function getCachedProjectRole(user: AccountRecord, projectId: ObjectID): Promise<Role> {
  const key = `role-${user ? user._id : '0'}-${projectId}`;
  return server.redis.get(key).then(res => {
    if (res !== null) {
      return res as unknown as Role;
    }
    return getProjectAndRole(server.db, user, projectId).then(({ role }) => {
      server.redis.set(key, role, 'EX', 600); // Expire in ten minutes
      return role;
    });
  });
}

export async function getOrganizationRole(
    db: Db, user: AccountRecord, orgId: ObjectID): Promise<number> {
  if (!user) {
    return Role.NONE;
  }

  if (user._id.equals(orgId)) {
    return Role.ADMINISTRATOR;
  }

  try {
    const membership = await db.collection('memberships').findOne<MembershipRecord>({
      user: user._id,
      organization: orgId,
    });
    return membership ? membership.role : Role.NONE;
  } catch (e) {
    logger.error('Error looking up organization role', { user: user.accountName, orgId });
    return Role.NONE;
  }
}
