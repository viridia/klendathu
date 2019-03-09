import * as bodyParser from 'body-parser';
import * as express from 'express';
import { server } from '../Server';
import { handleAsyncErrors } from './errors';
import { registry } from '../integrations';
import { ProjectRecord, WebhookRecord } from '../db/types';
import { ObjectID } from 'mongodb';
import { logger } from '../logger';

// Router for /auth paths
const hookRouter = express.Router();
hookRouter.use(bodyParser.json({
  limit: '10MB',
  verify: (req, res, buf) => {
    // Save raw body for signature verification
    (req as any).rawBody = buf.toString();
  },
}));

hookRouter.post(
    '/:service/:project',
    handleAsyncErrors(async (req: express.Request, res: express.Response) => {
  const service = registry.services.get(req.params.service);
  if (service) {
    const projects = server.db.collection<ProjectRecord>('projects');
    const project = await projects.findOne({ _id: new ObjectID(req.params.project) });
    if (!project) {
      logger.error('Webhook error: invalid project', { url: req.url });
      res.status(404).json({ error: 'invalid-project' });
      return;
    }

    const webhooks = server.db.collection<WebhookRecord>('webhooks');
    const webhook = await webhooks.findOne({
      project: project._id,
      serviceId: service.serviceId,
    });
    if (!webhook) {
      logger.error('Webhook error: invalid webhook', { url: req.url });
      res.status(404).json({ error: 'invalid-webhook' });
      return;
    }

    // TODO: Check secret

    service.handleRequest(req, res, project, webhook.secret, server.db);
  } else {
    logger.error('Webhook error: invalid service', { url: req.url });
    res.status(404).json({ error: 'invalid-service' });
  }
}));

// Catch-all hook handler
hookRouter.post('/', handleAsyncErrors(async (req, res) => {
  logger.error('Webhook error: invalid hook url', { url: req.url });
}));

server.app.use('/hook', hookRouter);
