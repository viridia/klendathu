import * as express from 'express';
import { WebhookServiceInfo } from '../../../common/types/graphql';
import { ProjectRecord } from '../db/types';
import { Db, ObjectID } from 'mongodb';

export interface WebhookService extends WebhookServiceInfo {
  /** Compute the hook url for a given project. */
  createUrl(projectId: ObjectID): string;

  /** Handle the incoming hook. */
  handleRequest(
    req: express.Request,
    res: express.Response,
    project: ProjectRecord,
    secret: string,
    db: Db): void;
}
