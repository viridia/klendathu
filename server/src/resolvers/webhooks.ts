import { WebhookRecord } from '../db/types';
import {
  WebhooksQueryArgs,
  WebhookServiceInfo,
  AddWebhookMutationArgs,
  UpdateWebhookMutationArgs,
  RemoveWebhookMutationArgs,
} from '../../../common/types/graphql';
import { Context } from './Context';
import { ObjectID } from 'mongodb';
import { Errors, Role } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { logger } from '../logger';
import { AuthenticationError, UserInputError } from 'apollo-server-core';
import { registry } from '../integrations';

export const queries = {
  async webhooks(
      _: any,
      { project }: WebhooksQueryArgs,
      context: Context): Promise<WebhookRecord[]> {
    const query: any = { project: new ObjectID(project) };
    return context.db.collection<WebhookRecord>('webhooks').find(query).toArray();
  },

  webhookServices(
      _: any,
      args: any,
      context: Context): WebhookServiceInfo[] {
    const result: WebhookServiceInfo[] = Array.from(registry.services.values());
    result.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
    return result;
  },
};

export const mutations = {
  async addWebhook(
      _: any,
      { input }: AddWebhookMutationArgs,
      context: Context): Promise<WebhookRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project, role } =
      await getProjectAndRole(context.db, context.user, new ObjectID(input.project));
    if (!project) {
      logger.error(
        'Attempt to add webhook to non-existent project:', { user, project: project._id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to add webhook:', { user, project: project._id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const webhooks = context.db.collection<WebhookRecord>('webhooks');
    const now = new Date();
    const result = await webhooks.insertOne({
      project: project._id,
      serviceId: input.serviceId,
      secret: input.secret,
      created: now,
      updated: now,
    });

    return result.ops[0];
  },

  async updateWebhook(
      _: any,
      { id, input }: UpdateWebhookMutationArgs,
      context: Context): Promise<WebhookRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }

    const user = context.user.accountName;
    const { project, role } =
      await getProjectAndRole(context.db, context.user, new ObjectID(input.project));
    if (!project) {
      logger.error(
        'Attempt to add webhook to non-existent project:', { user, project: project._id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to update webhook:', { user, project: project._id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const webhooks = context.db.collection<WebhookRecord>('webhooks');
    const now = new Date();
    const update: Partial<WebhookRecord> = {
      updated: now,
    };
    if ('secret' in input) {
      update.secret = input.secret;
    }
    const result = await webhooks.findOneAndUpdate({
      _id: new ObjectID(id)
    }, {
      $set: update
    }, {
      returnOriginal: false,
    });

    return result.value;
  },

  async removeWebhook(
    _: any,
    { id }: RemoveWebhookMutationArgs,
    context: Context): Promise<WebhookRecord> {
    if (!context.user) {
      throw new AuthenticationError(Errors.UNAUTHORIZED);
    }
    const user = context.user.accountName;
    const webhooks = context.db.collection<WebhookRecord>('webhooks');

    const record = await webhooks.findOne({ _id: new ObjectID(id)});
    if (!record) {
      logger.error('Attempt to remove non-existent webhook:', { user, id });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    const { project, role } = await getProjectAndRole(
      context.db, context.user, record.project);
    if (!project) {
      logger.error('Attempt to remove webhook from non-existent project:', { user, project });
      throw new UserInputError(Errors.NOT_FOUND);
    }

    if (role < Role.MANAGER) {
      logger.error('Insufficient permissions to remove webhook:', { user, project: project._id });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    const result = await webhooks.findOneAndDelete({ _id: record._id });
    return result.value;
  },
};

export const types = {
  Webhook: {
    id: (wr: WebhookRecord) => wr._id,
    serviceName: (wr: WebhookRecord) => {
      const svc = registry.services.get(wr.serviceId);
      return svc ? svc.serviceName : 'unknown-service';
    },
    url: (wr: WebhookRecord) => {
      const svc = registry.services.get(wr.serviceId);
      return svc ? svc.createUrl(wr.project) : '';
    },
    createdAt: (wr: WebhookRecord) => wr.created,
    updatedAt: (wr: WebhookRecord) => wr.updated,
  },
};
