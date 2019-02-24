import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as Bundler from 'parcel-bundler';
import { MongoClient, Db } from 'mongodb';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema';
import { logger } from './logger';
import { Context, resolverMap } from './resolvers';
import { decodeAuthToken } from './db/user';
import { createClient } from './db/client';

export class Server {
  public app = express();
  public client: MongoClient;
  public db: Db;
  public apollo = new ApolloServer({
    typeDefs,
    context: this.getContext.bind(this),
    resolvers: resolverMap,
    subscriptions: {
      // Authentication for websocket
      onConnect: async (connectionParams: any, webSocket) => {
        if (connectionParams.Authorization) {
          const m = connectionParams.Authorization.match(/Bearer\s+(.*)/);
          if (m) {
            const user = await decodeAuthToken(this.db, m[1]);
            return {
              db: this.db,
              client: this.client,
              user,
            };
          }
        }
        return {
          db: this.db,
          client: this.client,
          user: null,
        };
      },
      // onDisconnect: (websocket, context) => {
      //   console.log(context);
      // },
    },
    // formatError: (error: any) => {
    //   console.log(error);
    //   return new Error('Internal server error');
    //   // Or, you can delete the exception information
    //   // delete error.extensions.exception;
    //   // return error;
    // },
    introspection: true,
    playground: process.env.NODE_ENV !== 'production',
  });
  public httpServer: http.Server;

  // Note this is called *after* routes have been created
  public async start() {
    logger.debug('=== Klendathu Server ===');

    // Connect to the database
    this.client = await createClient();
    this.db = this.client.db(process.env.DB_NAME);

    // Add Apollo middleware
    this.apollo.applyMiddleware({ app: this.app });

    // Other middleware
    // TODO

    // Proxy client
    if (process.env.CLIENT_PROXY === 'true') {
      const indexPage = path.resolve(__dirname, '../../client/src/index.html');
      const bundler = new Bundler(indexPage, {});
      this.app.use((bundler as any).middleware());
    }

    // Start HTTP listener
    this.httpServer = this.app.listen({ port: 4000 }, () => {
      logger.info(`Started listening on localhost:4000`);
    });

    this.apollo.installSubscriptionHandlers(this.httpServer);
  }

  public stop() {
    logger.info(`Shutting down...`);
    this.httpServer.close();
    this.client.close();
  }

  private getContext(
      { req, connection }: { req: express.Request, connection: any }): Context {
    if (connection) {
      return connection.context;
    }
    return {
      db: this.db,
      client: this.client,
      user: (req as any).user,
    };
  }
}

export const server = new Server();
