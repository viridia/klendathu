import * as bodyParser from 'body-parser';
import * as express from 'express';
import { server } from '../Server';
import { handleAsyncErrors } from './errors';
import { registry } from '../integrations';
import { ProjectRecord, WebhookRecord } from '../db/types';
import { ObjectID } from 'mongodb';

// export interface GitHubUser {
//   name: string,
//   email: string;
//   username: string;
// }

// export interface GitHubCommit {
//   id: string;
//   message: string;
//   timestamp: string;
//   url: string;
//   author: GitHubUser;
//   committer: GitHubUser;
//   // [ { id: '62c61fc2b7311878b65de9287d0786f80ce1aa9f',
//   // tree_id: '1182939f19cfd2d3747ec2d6237bd5837f87c3ce',
//   // distinct: true,
//   // added: [Array],
//   // removed: [],
//   // modified: [Array] } ],
// }

// export interface GitHubCommitComment {
//   url: string;
//   id: number;
//   body: string;
//   commit_id: string;
//   user: {
//     login: string;
//   };
// }

// export interface GitHubPushEvent {
//   commits: GitHubCommit[];
// }

// export interface GitHubEvent {
//   action: 'created';
//   comment?: GitHubCommitComment;
// }

// Router for /auth paths
const hookRouter = express.Router();
hookRouter.use(bodyParser.json());

hookRouter.post(
    '/:service/:project',
    handleAsyncErrors(async (req: express.Request, res: express.Response) => {
  const service = registry.services.get(req.params.service);
  if (service) {
    const projects = server.db.collection<ProjectRecord>('projects');
    const project = await projects.findOne({ _id: new ObjectID(req.params.project) });
    if (!project) {
      res.status(404).json({ error: 'invalid-project' });
      return;
    }

    const webhooks = server.db.collection<WebhookRecord>('webhooks');
    const webhook = await webhooks.findOne({
      project: project._id,
      serviceId: service.serviceId,
    });
    if (!webhook) {
      res.status(404).json({ error: 'invalid-webhook' });
      return;
    }

    // TODO: Check secret

    service.handleRequest(req, res, project, server.db);
  } else {
    res.status(404).json({ error: 'invalid-service' });
  }
}));

// Catch-all hook handler
hookRouter.post('/', handleAsyncErrors(async (req, res) => {
  console.log(req.body);
}));

server.app.use('/hook', hookRouter);
