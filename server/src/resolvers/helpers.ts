export interface PaginatedResult<T> {
  count: number;
  offset: number;
  results: T[];
}
