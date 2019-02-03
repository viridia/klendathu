import * as React from 'react';
import { Role } from '../../../common/types/json';

export const roleNames: { [role: number]: string } = {
  [Role.NONE]: 'None',
  [Role.VIEWER]: 'Viewer',
  [Role.REPORTER]: 'Reporter',
  [Role.UPDATER]: 'Updater',
  [Role.DEVELOPER]: 'Developer',
  [Role.MANAGER]: 'Manager',
  [Role.ADMINISTRATOR]: 'Administrator',
  // [Role.OWNER]: 'Owner',
  // [Role.SYSTEM]: 'System',
};

export function RoleName({ role }: { role: Role }) {
  let roleName = roleNames[role];
  if (!roleName) {
    roleName = `Level ${role}`;
  }
  return <span className="role">{roleName}</span>;
}
