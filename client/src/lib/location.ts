/** Defines the state record stored in the browser history stack. */
export interface LocationState {
  pathname?: string;
  search?: string;
  back?: LocationState;
}
