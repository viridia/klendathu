import * as bodyParser from 'body-parser';
import * as express from 'express';
import { server } from '../Server';
import { handleAsyncErrors } from './errors';

// Router for /auth paths
const hookRouter = express.Router();
hookRouter.use(bodyParser.json());

// Login handler
hookRouter.post('/', handleAsyncErrors(async (req, res) => {
  console.log(req.body);
}));

server.app.use('/hook', hookRouter);
