import React from 'react';
import { DropdownButton, MenuItem } from 'skyhook-ui';
import { styled } from '../style';

interface Props {
  days: number;
  onChange: (days: number) => void;
}

const DurationDropdown = styled(DropdownButton)`
  width: 10rem;
`;

const durationsTable = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 21, label: '3 weeks' },
  { value: 28, label: '4 weeks' },
  { value: 35, label: '5 weeks' },
  { value: 42, label: '6 weeks' },
]

function weeksAndDays(days: number) {
  const weeks = Math.floor(days / 7);
  if (weeks > 0) {
    const rem = days - weeks * 7;
    if (weeks > 1) {
      if (rem > 1) {
        return `${weeks} weeks and ${rem} days`;
      }
      if (rem === 1) {
        return `${weeks} weeks and 1 day`;
      }
      return `${weeks} weeks`;
    }
    if (rem > 1) {
      return `1 week and ${rem} days`;
    }
    if (rem === 1) {
      return '1 week and 1 day';
    }
    return '1 week';
  }

  if (days !== 1) {
    return `${days} days`;
  } else {
    return '1 day';
  }
}

export function DurationSelector({ days, onChange }: Props) {
  return (
    <DurationDropdown
      id="duration-selector"
      title={weeksAndDays(days)}
      onSelect={(d: any) => onChange(Number(d))}
    >
      {durationsTable.map(dur => (
        <MenuItem key={dur.value} checked={days === dur.value} eventKey={`${dur.value}`}>
          {dur.label}
        </MenuItem>
      ))}
    </DurationDropdown>
  )
}
