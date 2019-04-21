import './env';
import { server } from './Server';
import * as path from 'path';
import * as Bundler from 'parcel-bundler';

// Set up express routes
import './routes/auth';
import './routes/files';
import './routes/webhooks';

server.start().then(() => {
  // Proxy client. Not located in Server.ts because unit tests won't run if this is linked in.
  if (process.env.CLIENT_PROXY === 'true') {
    const indexPage = path.resolve(__dirname, '../../client/src/index.html');
    const bundler = new Bundler(indexPage, {});
    server.app.use((bundler as any).middleware());
  }
});
