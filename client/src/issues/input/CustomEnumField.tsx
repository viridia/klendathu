import * as React from 'react';
import classNames from 'classnames';
import { MenuItem, DropdownButton } from '../../controls';
import { FieldType } from '../../../../common/types/json';

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
            className={classNames({ active: v === value })}
            onClick={() => onChange(field.id, v)}
        >
          {v}
        </MenuItem>)}
    </DropdownButton>
  );
}
