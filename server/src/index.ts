import './env';
import { server } from './Server';

// Set up express routes
import './routes/auth';

server.start();
