import { TemplateRecord } from '../db/types';
import { Context } from './Context';
import {
  TemplateQueryArgs,
  SetTemplateMutationArgs,
} from '../../../common/types/graphql';
import { ObjectID } from 'mongodb';
import { getOrganizationRole } from '../db/role';
import { Role, Errors } from '../../../common/types/json';
import { logger } from '../logger';
import { UserInputError } from 'apollo-server-core';

export const queries = {
  async template(
      _: any,
      { owner, name }: TemplateQueryArgs,
      context: Context): Promise<TemplateRecord> {
    const templates = context.db.collection('templates');
    const result = await templates.findOne<TemplateRecord>({
      owner: new ObjectID(owner),
      name,
     });
    return result;
  },
};

export const mutations = {
  async setTemplate(
      _: any,
      { owner, name, template }: SetTemplateMutationArgs,
      context: Context): Promise<TemplateRecord> {
    const user = context.user ? context.user.accountName : null;
    const role = await getOrganizationRole(context.db, context.user, new ObjectID(owner));
    if (role < Role.MANAGER) {
      logger.error('Permission denied updating template:', { user, owner, name });
      throw new UserInputError(Errors.FORBIDDEN);
    }

    // TODO: AJV validation.
    console.log('set template', name, template);
    return null;
  },
};

export const types = {
  JSONObject: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
  },
};
