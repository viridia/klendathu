export function idToIndex(id: string): string {
  if (!id) {
    return null;
  }
  return id.split('.', 2)[1];
}