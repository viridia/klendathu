/** Catches exceptions and turns them into Express errors. */
export const handleAsyncErrors =
  (fn: (...args: any[]) => Promise<any>) => (...args: any[]) => fn(...args).catch(args[2]);
