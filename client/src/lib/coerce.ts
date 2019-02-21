export function coerceToString(value: string | string[]): string {
  if (typeof value === 'string') {
    return value;
  } else if (Array.isArray(value)) {
    return value[0];
  } else if (!value) {
    return undefined;
  } else {
    return undefined;
  }
}

export function coerceToStringArray(value: string | string[]): string[] {
  if (typeof value === 'string') {
    return [value];
  } else if (Array.isArray(value)) {
    return value;
  } else {
    return [];
  }
}
