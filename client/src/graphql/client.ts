import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { session } from '../models';
import { OperationDefinitionNode } from 'graphql';

const wsLink = new WebSocketLink({
  uri: `ws://${window.location.host}/graphql`,
  options: {
    reconnect: true,
    connectionParams: () => session ? { ...session.headers } : {},
  }
});

const httpLink = new HttpLink({
  uri: '/graphql',
  credentials: 'same-origin'
});

// split based on operation type
const muxLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

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
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
      }
    }),
    authLink,
    muxLink,
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

export function decodeErrorAsException(error: any): [string, string] {
  const [code] = decodeError(error);
  throw new Error(code);
}
