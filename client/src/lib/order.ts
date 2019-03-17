export type Comparator<T> = (a: T, b: T) => number;

/** Given an array of comparators, return a comparator function that works by applying
    each of the input functions in order until one produces a non-zero result. */
export function orderBy<T>(comparators: Array<Comparator<T>>): Comparator<T> {
  return (a: T, b: T) => {
    for (const cmp of comparators) {
      const result = cmp(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
}

/** Property comparator */
export function localeCompareProperty<T, K extends keyof T>(propName: K): Comparator<T> {
  return (a: any, b: any): number => ('' + a[propName]).localeCompare(b[propName]);
}

/** Property comparator */
export function numberCompareProperty<T, K extends keyof T>(propName: K): Comparator<T> {
  return (a: any, b: any): number => {
    if (a[propName] < b[propName]) {
      return -1;
    }
    if (a[propName] > b[propName]) {
      return 1;
    }
    return 0;
  };
}
