export class MultiMap<K, V> {
  private data = new Map<K, V[]>();

  public add(key: K, value: V) {
    const list = this.data.get(key);
    if (list) {
      list.push(value);
    } else {
      this.data.set(key, [value]);
    }
  }

  public addUnique(key: K, value: V) {
    const list = this.data.get(key);
    if (list) {
      if (list.indexOf(value) < 0) {
        list.push(value);
      }
    } else {
      this.data.set(key, [value]);
    }
  }

  public get(key: K): V[] {
    return this.data.get(key) || [];
  }

  public has(key: K): boolean {
    return this.data.has(key);
  }

  public keys() {
    return this.data.keys();
  }

  public forEach(callback: (value: V, key: K) => void) {
    this.data.forEach((values, key) => {
      values.forEach(v => callback(v, key));
    });
  }
}
