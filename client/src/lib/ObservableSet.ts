import { ObservableMap } from 'mobx';

/** Implements a mobx observable set using a map of strings to booleans. */
export class ObservableSet {
  private value = new ObservableMap<string, boolean>();

  constructor(members?: string[]) {
    if (members) {
      this.value.replace(members.map(m => [m, true]));
    }
  }

  /** Add a member to the set. */
  public add(key: string): void {
    this.value.set(key, true);
  }

  /** Remove a member from the set. */
  public delete(key: string): void {
    this.value.delete(key);
  }

  /** Test whether a member is in the set. */
  public has(key: string): boolean {
    return !!this.value.get(key);
  }

  /** Return the size of the set. */
  public get size(): number {
    return this.value.size;
  }

  /** Return an array of all the values of the set. */
  public get values(): string[] {
    return Array.from(this.value.keys());
  }

  /** Remove all members from the set. */
  public clear(): void {
    this.value.clear();
  }

  /** Iterate over all the members of the set. */
  public forEach(callback: (value1: string, index?: number) => void): void {
    let index = 0;
    for (const key of this.value.keys()) {
      callback(key, index);
      index += 1;
    }
  }
}
