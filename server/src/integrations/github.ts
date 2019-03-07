import * as express from 'express';
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
  action: 'created';
  comment?: GitHubCommitComment;
}

export class GitHubIntegration implements WebhookService {
  public serviceId = 'github';
  public serviceName = 'GitHub';

  public createUrl(projectId: ObjectID): string {
    const url = new URL(process.env.PUBLIC_URL);
    url.pathname = `/hook/${this.serviceId}/${projectId}`;
    return url.toString();
  }

  public handleRequest(
    req: express.Request,
    res: express.Response,
    project: ProjectRecord,
    db: Db) {
      const event = req.headers['X-GitHub-Event'];
      const rawBody: string = (req as any).rawBody || '';
      console.log('event', event);
      console.log('raw body size', rawBody.length);
      console.log('X-Hub-Signature', req.headers['X-Hub-Signature']);
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
