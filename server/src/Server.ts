import * as express from 'express';
import * as http from 'http';
import * as Redis from 'ioredis';
import { MongoClient, Db, GridFSBucket } from 'mongodb';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema';
import { logger } from './logger';
import { Context, resolverMap } from './resolvers';
import { decodeAuthToken } from './db/user';
import { createClient } from './db/client';
import { initRedisPubSub, closePubSub } from './resolvers/pubsub';

export class Server {
  public app = express();
  public client: MongoClient;
  public db: Db;
  public bucket: GridFSBucket;
  public apollo = new ApolloServer({
    typeDefs,
    context: this.getContext.bind(this),
    resolvers: resolverMap,
    subscriptions: {
      // Authentication for websocket
      onConnect: async (connectionParams: any, webSocket) => {
        if (connectionParams.authToken) {
          const user = await decodeAuthToken(this.db, connectionParams.authToken);
          return new Context(this.db, user);
        }
        return new Context(this.db, null);
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
  public redis: Redis.Redis;

  // Note this is called *after* routes have been created
  public async start() {
    logger.debug('=== Klendathu Server ===');

    // Connect to the database
    this.client = await createClient();
    this.db = this.client.db(process.env.DB_NAME);
    this.bucket = new GridFSBucket(this.db);

    // Add Apollo middleware
    this.apollo.applyMiddleware({ app: this.app, cors: false });

    // Set up the connection to Redis. Pubsub is a global so that resolvers don't have
    // a dependency on Server.
    initRedisPubSub();
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });

    // Start HTTP listener
    const port = Number(process.env.SERVER_PORT || 4000);
    this.httpServer = this.app.listen({ port }, () => {
      logger.info(`Started listening on port ${port}`);
    });

    this.apollo.installSubscriptionHandlers(this.httpServer);
  }

  public stop() {
    logger.info('Shutting down...');
    this.redis.disconnect();
    this.httpServer.close();
    this.client.close();
    closePubSub();
  }

  private getContext(
    { req, connection }: { req: express.Request; connection: any }): Context {
    if (connection) {
      return connection.context;
    }
    return new Context(this.db, (req as any).user);
  }
}

export const server = new Server();
