import * as express from 'express';
import * as crypto from 'crypto';
import { URL } from 'url';
import { registry } from './WebhookRegistry';
import { WebhookService } from './WebhookService';
import { ProjectRecord } from '../db/types';
import { Db, ObjectID } from 'mongodb';

interface GitHubUser {
  name: string;
  email: string;
  username: string;
}

interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: GitHubUser;
  committer: GitHubUser;
  // [ { id: '62c61fc2b7311878b65de9287d0786f80ce1aa9f',
  // tree_id: '1182939f19cfd2d3747ec2d6237bd5837f87c3ce',
  // distinct: true,
  // added: [Array],
  // removed: [],
  // modified: [Array] } ],
}

interface GitHubCommitComment {
  url: string;
  id: number;
  body: string;
  commit_id: string;
  user: {
    login: string;
  };
}

interface GitHubPushEvent {
  commits: GitHubCommit[];
}

interface GitHubEvent {
  action: 'closed' | 'created' | 'opened';
  comment?: GitHubCommitComment;
}

function verifySignature(signature: string, data: string, secret: string) {
  const computedSignature = crypto.createHmac('sha1', secret).update(data).digest('hex');
  return Buffer.from(signature).equals(Buffer.from(`sha1=${computedSignature}`));
}

export class GitHubIntegration implements WebhookService {
  public serviceId = 'github';
  public serviceName = 'GitHub';

  public createUrl(projectId: ObjectID): string {
    const url = new URL(process.env.WEBHOOK_URL || process.env.PUBLIC_URL);
    url.pathname = `/hook/${this.serviceId}/${projectId}`;
    return url.toString();
  }

  public handleRequest(
      req: express.Request,
      res: express.Response,
      project: ProjectRecord,
      secret: string,
      db: Db) {
    console.log(Object.getOwnPropertyNames(req.headers));
    const event = req.headers['x-github-event'].toString();
    const signature = req.headers['x-hub-signature'].toString();
    const rawBody: string = (req as any).rawBody || '';
    console.log('event', event);
    console.log('raw body size', rawBody.length);
    console.log('signature', signature);
    if (!verifySignature(signature, rawBody, secret)) {
      console.log('invalid signature', event);
      res.status(401).json({ error: 'invalid-signature' });
      return;
    }
    if (req.body.commits) {
      const commitEvent: GitHubPushEvent = req.body;
      console.log('commit', req.params.project, JSON.stringify(commitEvent, null, 2));
      res.end();
    } else {
      const ev: GitHubEvent = req.body;
      console.log('event', req.params.project, JSON.stringify(ev, null, 2));
      res.end();
    }
  }
}

registry.add(new GitHubIntegration());
