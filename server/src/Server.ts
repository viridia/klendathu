import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import { MongoClient, Db } from 'mongodb';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema';
import { logger } from './logger';
import { Context, resolverMap } from './resolvers';
import { ensureCollections } from './db/helpers';
import * as Bundler from 'parcel-bundler';

// Connection URL
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'klendathu';

export class Server {
  public app = express();
  public client: MongoClient;
  public db: Db;
  public apollo = new ApolloServer({
    typeDefs,
    context: this.getContext.bind(this),
    resolvers: resolverMap,
    introspection: true,
    playground: process.env.NODE_ENV !== 'production',
  });
  public httpServer: http.Server;

  // Note this is called after routes have been created
  public async start() {
    logger.debug('=== Klendathu Server ===');

    // Connect to the database
    this.client = await MongoClient.connect(dbUrl, {
      useNewUrlParser: true,
      auth: { user: 'root', password: 'example' }
    });
    this.db = this.client.db(dbName);
    logger.debug(`Connected to ${dbUrl}`);
    await ensureCollections(this.db, [
      'accounts',
      'comments',
      'issues',
      'issueChanges',
      'issueLinks',
      'labels',
      'memberships',
      'milestones',
      'projects',
      'projectPrefs',
      'templates',
    ]);

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
  }

  public stop() {
    logger.info(`Shutting down...`);
    this.httpServer.close();
    this.client.close();
  }

  private getContext({ req }: { req: express.Request }): Context {
    return {
      db: this.db,
      client: this.client,
    };
  }
}

export const server = new Server();
