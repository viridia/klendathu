// import * as yargs from 'yargs';
// import { HttpLink } from 'apollo-link-http';
// import { ApolloClient } from '@apollo/client';
// import { ApolloLink } from 'apollo-link';
// import { InMemoryCache } from 'apollo-cache-inmemory';
// import { setContext } from 'apollo-link-context';
// import { onError } from 'apollo-link-error';
// import fetch from 'node-fetch';
// import gql from 'graphql-tag';

// const ProjectsQuery = gql`query { projects { id name title } }`;
// const authHeaders: any = {};

// function connect(uri: URL) {
//   return new ApolloClient({
//     link: ApolloLink.from([
//       onError(({ graphQLErrors, networkError }) => {
//         if (graphQLErrors) {
//           graphQLErrors.map(({ message, locations, path }) =>
//             console.error(
//               `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
//             ),
//           );
//         }
//         if (networkError) {
//           console.error(`[Network error]: ${networkError}`);
//         }
//       }),
//       setContext((_, { headers }) => ({
//         headers: {
//           ...headers,
//           ...authHeaders,
//         }
//       })),
//       new HttpLink({
//         uri: uri.toString(),
//         credentials: 'same-origin',
//         fetch
//       }),
//     ]),
//     cache: new InMemoryCache()
//   });
// }

// const argv = yargs
//   .scriptName('manage')
//   .usage('Usage: $0 <command> [options]')
//   .option('host', {
//     describe: 'URL of Klendathu server',
//     default: process.env.HOST,
//   })
//   .option('token', {
//     describe: 'Authentication token',
//     default: process.env.AUTH_TOKEN,
//   })
//   .command('init', 'create the default account', {}, ((args: any) => {
//     if (!args.host) {
//       console.error('Host name is required.');
//       process.exit(-1);
//     }
//     if (!args.token) {
//       console.error('Authentication token is required.');
//       process.exit(-1);
//     }
//     authHeaders.Authorization = `Bearer ${args.token}`;
//     const uri = new URL(args.host);
//     uri.pathname = '/graphql';
//     const client = connect(uri);
//     console.info('Initializating default database account.');
//     client.query({
//       query: ProjectsQuery,
//     }).then(({ data }) => {
//       console.info(data);
//     });
//   }) as any)
//   .parse();
