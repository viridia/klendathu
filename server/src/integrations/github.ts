import * as express from 'express';
import * as crypto from 'crypto';
import { URL } from 'url';
import { registry } from './WebhookRegistry';
import { WebhookService } from './WebhookService';
import { ProjectRecord } from '../db/types';
import { Db, ObjectID } from 'mongodb';
import { logger } from '../logger';
import { escapeRegExp } from '../db/helpers';

enum GHEvent {
  PULL_REQUEST = 'pull_request',
  PUSH = 'push',
}

interface GitHubCommitter {
  name: string;
  email: string;
  username: string;
}

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: GitHubCommitter;
  committer: GitHubCommitter;
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

interface GitHubPullRequst {
  url: string;
  html_url: string;
  merged: boolean;
  number: number;
  state: 'closed';
  title: string;
  body: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  closed_at: string;
  merged_at: string;
}

interface GitHubEvent {
  action: 'closed' | 'created' | 'edited' | 'opened' | 'reopened' | 'synchronize';
  comment?: GitHubCommitComment;
  pull_request?: GitHubPullRequst;
}

function verifySignature(signature: string, data: string, secret: string) {
  const computedSignature = crypto.createHmac('sha1', secret).update(data).digest('hex');
  return Buffer.from(signature).equals(Buffer.from(`sha1=${computedSignature}`));
}

const BASE_URL = escapeRegExp(process.env.PUBLIC_URL);
const URL_RE = new RegExp(`^${BASE_URL}/([\w_\\-\\.]+)/([\w_\\-\\.]+)/(\d+)`, 'mg');

function scanForLinks(message: string) {
  const re = new RegExp(URL_RE);
  while (true) {
    const m = re.exec(message);
    if (!m) {
      break;
    }
    const [, account, project, issue] = m;
    console.log(account, project, issue);
  }
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
    const event = req.headers['x-github-event'].toString() as GHEvent;
    const signature = req.headers['x-hub-signature'].toString();
    const rawBody: string = (req as any).rawBody || '';
    if (!verifySignature(signature, rawBody, secret)) {
      logger.error('invalid github signature');
      res.status(401).json({ error: 'invalid-signature' });
      return;
    }

    if (event === GHEvent.PUSH) {
      if (req.body.commits) {
        const commitEvent: GitHubPushEvent = req.body;
        console.log('commits:', commitEvent.commits.length);
        // console.log('commit', JSON.stringify(commitEvent, null, 2));
      }
    } else {
      const ev: GitHubEvent = req.body;
      switch (event) {
        case GHEvent.PULL_REQUEST:
          if (ev.action === 'opened') {
            console.log('scanning for links in PR.');
            scanForLinks(ev.pull_request.title);
            scanForLinks(ev.pull_request.body);
            // Opened a pull request
          } else if (ev.action === 'edited') {
            // Edited a pull request
          } else if (ev.action === 'closed') {
            if (ev.pull_request.merged) {
              // Merged a pull request
            } else {
              // Closed a pull request
            }
          }
          break;
      }
      // console.log('event', JSON.stringify(ev, null, 2));
    }
    res.end();
  }
}

registry.add(new GitHubIntegration());
