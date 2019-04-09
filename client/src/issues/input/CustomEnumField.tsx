import * as React from 'react';
import { FieldType } from '../../../../common/types/json';
import { DropdownButton, MenuItem } from 'skyhook-ui';

interface Props {
  field: FieldType;
  value: string;
  onChange: (id: string, value: string) => void;
}

export function CustomEnumField(props: Props) {
  const { value, field, onChange } = props;
  return (
    <DropdownButton title={value} >
      {field.values.map(v =>
        <MenuItem
          key={v}
          active={v === value}
          onClick={() => onChange(field.id, v)}
        >
          {v}
        </MenuItem>)}
    </DropdownButton>
  );
}
