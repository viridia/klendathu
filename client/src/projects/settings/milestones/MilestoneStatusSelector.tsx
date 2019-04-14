import * as React from 'react';
import { MilestoneStatus } from '../../../../../common/types/graphql';
import { styled } from '../../../style';
import { DropdownButton, MenuItem } from 'skyhook-ui';

const states: MilestoneStatus[] = [
  MilestoneStatus.Active,
  MilestoneStatus.Pending,
  MilestoneStatus.Concluded,
  MilestoneStatus.Timeless,
];

const statusNames = {
  [MilestoneStatus.Active]: 'Active',
  [MilestoneStatus.Pending]: 'Pending',
  [MilestoneStatus.Concluded]: 'Concluded',
  [MilestoneStatus.Timeless]: 'Timeless',
};

const MilestoneStatusDropdown = styled(DropdownButton)`
  width: 10rem;
`;

interface Props {
  value: MilestoneStatus;
  disabled?: boolean;
  onChange: (status: MilestoneStatus) => void;
}

export function MilestoneStatusSelector({ value, disabled, onChange }: Props) {
  return (
    <MilestoneStatusDropdown
      id="milestone-status-selector"
      title={statusNames[value]}
      disabled={disabled}
      onSelect={state => onChange(state as MilestoneStatus)}
    >
      {states.map(state => (
        <MenuItem key={state} checked={state === value} eventKey={state.toString()}>
          {statusNames[state]}
        </MenuItem>
      ))}
    </MilestoneStatusDropdown>
  );
}
