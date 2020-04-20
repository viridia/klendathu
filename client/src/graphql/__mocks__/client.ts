import { ApolloClient } from '@apollo/client';

export const client: ApolloClient<any> = null;

export function decodeError(error: any): [string, string] {
  for (const e of error.graphQLErrors) {
    if (e.message) {
      const field = e.extensions && e.extensions.exception && e.extensions.exception.field;
      return [e.message, field];
    }

    return [undefined, undefined];
  }
}

export function decodeErrorAsException(error: any): [string, string] {
  const [code] = decodeError(error);
  throw new Error(code);
}
