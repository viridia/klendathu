import { ChangeAction } from '../../../common/types/graphql';

/** Function which applies a change action to a list of query results in the Apollo cache. */
export function updateQueryResults<T extends { id: string }>(
    list: T[],
    change: { action: ChangeAction; value: T }) {
  switch (change.action) {
    case ChangeAction.Added: {
      return [...list, change.value];
    }
    case ChangeAction.Changed: {
      return list.map(item => item.id === change.value.id ? change.value : item);
    }
    case ChangeAction.Removed: {
      return list.filter(item => item.id !== change.value.id);
    }
  }
}
