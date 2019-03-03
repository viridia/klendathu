import * as React from 'react';
import { roleNames } from './RoleName';
import { observer } from 'mobx-react';
import { DropdownButton } from './Dropdown';
import { Role } from '../../../common/types/json';
import { MenuItem } from './Menu';

const roles: Role[] = [
  Role.VIEWER,
  Role.REPORTER,
  Role.UPDATER,
  Role.DEVELOPER,
  Role.MANAGER,
  Role.ADMINISTRATOR,
];

interface Props {
  value: Role;
  maxRole: Role;
  disabled?: boolean;
  onChange: (role: any) => void;
}

@observer
export class RoleSelector extends React.Component<Props> {
  public render() {
    const { value, maxRole = Role.ADMINISTRATOR, disabled, onChange } = this.props;
    return (
      <DropdownButton
        id="role-selector"
        title={roleNames[value]}
        disabled={disabled}
        onSelect={role => onChange(Number(role))}
      >
        {roles.map(role => (
          <MenuItem key={role} disabled={role > maxRole} eventKey={role.toString()}>
            {roleNames[role]}
          </MenuItem>
        ))}
      </DropdownButton>
    );
  }
}
