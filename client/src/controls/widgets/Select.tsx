import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem } from './Menu';
import { SizeVariant } from 'skyhook-ui';

export interface Option<T = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

interface Props<T> {
  value: T | null;
  placeholder?: React.ReactNode;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
  size?: SizeVariant;
  width?: string;
}

export function Select<T = string>(
  { value, options, placeholder, onChange, size, width, className }: Props<T>) {
  const selectedOption = options.find(opt => opt.value === value);
  return (
    <Menu>
      <MenuButton className={className} size={size} width={width}>
        {selectedOption ? selectedOption.label : placeholder}
      </MenuButton>
      <MenuList align="justify" checkmarks>
        {options.map(opt => (
          <MenuItem
            key={String(opt.value)}
            onSelect={() => onChange(opt.value)}
            checked={value === opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
