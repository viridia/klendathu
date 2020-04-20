import * as React from 'react';
import { TimeboxStatus } from '../../../../../common/types/graphql';
import { styled } from '../../../style';
import { DropdownButton, MenuItem } from 'skyhook-ui';

const states: TimeboxStatus[] = [
  TimeboxStatus.Active,
  TimeboxStatus.Pending,
  TimeboxStatus.Concluded,
  TimeboxStatus.Timeless,
];

const statusNames = {
  [TimeboxStatus.Active]: 'Active',
  [TimeboxStatus.Pending]: 'Pending',
  [TimeboxStatus.Concluded]: 'Concluded',
  [TimeboxStatus.Timeless]: 'Timeless',
};

const TimeboxStatusDropdown = styled(DropdownButton)`
  width: 10rem;
`;

interface Props {
  value: TimeboxStatus;
  disabled?: boolean;
  onChange: (status: TimeboxStatus) => void;
}

export function TimeboxStatusSelector({ value, disabled, onChange }: Props) {
  return (
    <TimeboxStatusDropdown
      id="timebox-status-selector"
      title={statusNames[value]}
      disabled={disabled}
      onSelect={state => onChange(state as TimeboxStatus)}
    >
      {states.map(state => (
        <MenuItem key={state} checked={state === value} eventKey={state.toString()}>
          {statusNames[state]}
        </MenuItem>
      ))}
    </TimeboxStatusDropdown>
  );
}
