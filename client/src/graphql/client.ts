import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import { session } from '../models';

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...session.headers,
  }
}));

export const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    authLink,
    new HttpLink({
      uri: '/graphql',
      credentials: 'same-origin'
    })
  ]),
  cache: new InMemoryCache()
});

export function decodeError(error: any): [string, string] {
  for (const e of error.graphQLErrors) {
    if (e.message) {
      const field = e.extensions && e.extensions.exception && e.extensions.exception.field;
      return [e.message, field];
    }

    return [undefined, undefined];
  }
}
