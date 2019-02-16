export function coerceToString(param: string | string[]): string {
  if (!param) {
    return undefined;
  } else if (typeof param === 'string') {
    return param;
  } else if (Array.isArray(param)) {
    return param[0];
  } else {
    return undefined;
  }
}

export function coerceToStringArray(param: string | string[]): string[] {
  if (!param) {
    return undefined;
  } else if (typeof param === 'string') {
    return [param];
  } else if (Array.isArray(param)) {
    return param;
  } else {
    return undefined;
  }
}
