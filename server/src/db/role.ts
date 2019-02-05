import { AccountRecord, ProjectRecord, MembershipRecord } from './types';
import { Role } from '../../../common/types/json';
import { Db, ObjectID } from 'mongodb';
import { logger } from '../logger';

export async function getProjectRole(
    db: Db, user: AccountRecord, project: ProjectRecord): Promise<number> {
  if (!project) {
    return Role.NONE;
  }

  if (!user) {
    return project.isPublic ? Role.NONE : Role.VIEWER;
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
    projectId: ObjectID): Promise<{ project?: ProjectRecord, role: Role }> {
  const projects = db.collection('projects');
  const project = await projects.findOne<ProjectRecord>({ _id: projectId });
  if (project) {
    const role = await getProjectRole(db, user, project);
    return { project, role };
  }
  return { role: Role.NONE };
}
