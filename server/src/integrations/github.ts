import * as express from 'express';
import * as crypto from 'crypto';
import { URL } from 'url';
import { registry } from './WebhookRegistry';
import { WebhookService } from './WebhookService';
import { ProjectRecord, CommitRecord, IssueRecord } from '../db/types';
import { Db, ObjectID } from 'mongodb';
import { logger } from '../logger';
import { escapeRegExp } from '../db/helpers';

/* eslint-disable camelcase */
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

const BASE_URL = escapeRegExp(process.env.PUBLIC_URL || '');
const URL_RE = new RegExp(`^${BASE_URL}/([\\w_\\-\\.]+)/([\\w_\\-\\.]+)/(\\d+)`, 'mg');

function scanForIssueLinks(message: string, pr: ProjectRecord, out: Set<string>) {
  const re = new RegExp(URL_RE);
  for (;;) {
    const m = re.exec(message);
    if (!m) {
      break;
    }
    const [, account, project, issue] = m;
    if (account === pr.ownerName && pr.name === project) {
      out.add(`${pr._id}.${issue}`);
    }
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
          logger.info(`GitHub commit ${ev.action}: ${ev.pull_request.html_url}`);
          if (ev.action === 'opened' ||
              ev.action === 'reopened' ||
              ev.action === 'synchronize' ||
              ev.action === 'edited') {
            const issues = new Set<string>();
            scanForIssueLinks(ev.pull_request.title, project, issues);
            scanForIssueLinks(ev.pull_request.body, project, issues);
            if (issues.size > 0) {
              this.updateCommit(db, ev, project, issues);
            }
          } else if (ev.action === 'closed') {
            this.closeCommit(db, ev);
          }
          break;

        default:
          logger.debug(`GitHub event not handled: ${event}.`);
          // console.log('event', JSON.stringify(ev, null, 2));
          break;
      }
    }
    res.end();
  }

  private async updateCommit(db: Db, ev: GitHubEvent, project: ProjectRecord, issues: Set<string>) {
    const pr = ev.pull_request;
    // TODO: we need to resolve the user id, if possible.

    // Make sure these issues exist
    const issueRecords = await db.collection<IssueRecord>('issues').find({
      _id: { $in: Array.from(issues) }
    }).toArray();

    if (issueRecords.length === 0) {
      logger.error('GitHub error: invalid issue ids:', { issues: Array.from(issues) });
      return;
    }

    const commits = db.collection<CommitRecord>('commits');
    // Use url as primary key
    await commits.findOneAndUpdate({
      url: pr.html_url,
    }, {
      $set: {
        updated: new Date(pr.updated_at),
        submitted: pr.merged,
        message: pr.title,
        project: project._id,
      },
      $addToSet: {
        issues: { $each: issueRecords.map(iss => iss._id) },
      },
      $setOnInsert: {
        serviceId: this.serviceId,
        commit: String(pr.number),
        url: pr.html_url,
        user: {
          username: pr.user.login,
        },
        created: new Date(pr.created_at),
      }
    }, {
      upsert: true,
    });

    // TODO: Update issue timeline
  }

  private async closeCommit(db: Db, ev: GitHubEvent) {
    const pr = ev.pull_request;
    const commits = db.collection<CommitRecord>('commits');
    await commits.findOneAndUpdate({
      url: pr.html_url,
    }, {
      $set: {
        updated: new Date(pr.updated_at),
        submitted: pr.merged,
      },
    });
  }
}

registry.add(new GitHubIntegration());
