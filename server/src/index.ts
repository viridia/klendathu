import './env';
import { server } from './Server';

// Set up express routes
import './routes/auth';
import './routes/files';
import './routes/webhooks';

server.start();
