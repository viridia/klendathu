import { session } from './Session';
import { OperandType, defaultOperandValue } from './OperandType';
import { FilterTerm } from './FilterTerm';
import { FieldType, DataType } from '../../../common/types/json';
import { Predicate, PublicAccount } from '../../../common/types/graphql';
import { idToIndex } from '../lib/idToIndex';
import { ObservableSet } from 'mobx';
import { ViewContext } from './ViewContext';
import { queryAccount } from '../graphql';
import { coerceToStringArray, coerceToString } from '../lib/coerce';

interface Query {
  [key: string]: string | string[];
}

function resolveAccountName(accountName: string): Promise<PublicAccount> {
  if (accountName === 'none' || !accountName) {
    return Promise.resolve(null);
  } else if (accountName === 'me') {
    return Promise.resolve(session.account);
  } else {
    return queryAccount({ accountName }).then(
      account => account.data.account,
      error => {
        console.error(`Error fetching account name: ${accountName}`, error);
        return Promise.resolve(null);
      }
    );
  }
}

export interface FilterTermDescriptor {
  /** Display name of this fiter term. */
  caption: string;

  /** Data type of filter operand. */
  type: OperandType;

  /** If this filter term is defined by a custom template field. */
  customField?: FieldType;

  /** Construct a query string from the filter terms. */
  buildQuery: (query: Query, term: FilterTerm) => void;

  /** Get filter term operand from query string. */
  parseQuery: (query: Query, term: FilterTerm, env: ViewContext) => void;
}

export const descriptors: { [type: string]: FilterTermDescriptor } = {
  state: {
    caption: 'State',
    type: OperandType.STATE_SET,
    buildQuery: (query, term) => {
      if (term.value) {
        const states: ObservableSet = term.value;
        query.state = Array.from(states);
      }
    },
    parseQuery(query, term, env) {
      const state = query.state;
      term.value = state === 'open'
        ? defaultOperandValue(env.template, OperandType.STATE_SET, null)
        : new ObservableSet(coerceToStringArray(state));
    },
  },
  type: {
    caption: 'Type',
    type: OperandType.TYPE_SET,
    buildQuery: (query, term) => {
      if (term.value) {
        const types: ObservableSet = term.value;
        query.type = Array.from(types);
      }
    },
    parseQuery(query, term, env) {
      const type = query.type;
      term.value = new ObservableSet(coerceToStringArray(type));
    },
  },
  summary: {
    caption: 'Summary',
    type: OperandType.SEARCH_TEXT,
    buildQuery: (query, term) => {
      query.summary = term.value;
      if (term.predicate) {
        query.summaryPred = term.predicate;
      }
    },
    parseQuery(query, term, env) {
      term.value = query.summary;
      term.predicate = query.summaryPred as Predicate;
    },
  },
  description: {
    caption: 'Description',
    type: OperandType.SEARCH_TEXT,
    buildQuery: (query, term) => {
      query.description = term.value;
      if (term.predicate) {
        query.descriptionPred = term.predicate;
      }
    },
    parseQuery(query, term, env) {
      term.value = query.description;
      term.predicate = query.descriptionPred as Predicate;
    },
  },
  reporter: {
    caption: 'Reporter',
    type: OperandType.USER,
    buildQuery: (query, term) => {
      if (term.value) {
        const account: PublicAccount = term.value;
        query.reporter = account.accountName;
      } else {
        query.reporter = 'none';
      }
    },
    parseQuery(query, term, env) {
      resolveAccountName(coerceToString(query.reporter)).then(account => {
        term.value = account;
      });
    },
  },
  owner: {
    caption: 'Owner',
    type: OperandType.USER,
    buildQuery: (query, term) => {
      if (term.value) {
        const account: PublicAccount = term.value;
        query.owner = account.accountName;
      } else {
        query.owner = 'none';
      }
    },
    parseQuery(query, term, env) {
      resolveAccountName(coerceToString(query.owner)).then(account => {
        term.value = account;
      });
    },
  },
  cc: {
    caption: 'CC',
    type: OperandType.USERS,
    buildQuery: (query, term) => {
      if (term.value) {
        query.cc = term.value.map((account: PublicAccount) => account.accountName);
      }
    },
    parseQuery(query, term, env) {
      term.value = Promise.all(coerceToStringArray(query.cc).map(resolveAccountName))
          .then(accounts => accounts.filter(a => a));
    }
  },
  label: {
    caption: 'Labels',
    type: OperandType.LABEL,
    buildQuery: (query, term) => {
      if (term.value) {
        const labels: string[] = term.value;
        query.label = labels.map(idToIndex);
      }
    },
    parseQuery(query, term, env) {
      const { project } = env;
      term.value = [];
      if (typeof query.label === 'string') {
        term.value = coerceToStringArray(query.label).map(n => `${project.id}.${n}`);
      }
    }
  },
};

export function getDescriptor(env: ViewContext, fieldId: string): FilterTermDescriptor {
  if (fieldId && fieldId.startsWith('custom.')) {
    const id = fieldId.slice(7);
    const customField = env.fields.get(id);
    if (customField) {
      switch (customField.type) {
        case DataType.ENUM: {
          return {
            caption: customField.caption,
            type: OperandType.ENUM,
            customField,
            buildQuery: (query, term) => {
              if (term.value) {
                query[fieldId] = Array.from(term.value as ObservableSet);
                query[`pred.${id}`] = Predicate.In;
              }
            },
            parseQuery: (query, term) => {
              term.value = new ObservableSet(coerceToStringArray(query[fieldId]));
            },
          };
        }
        case DataType.TEXT:
          return {
            caption: customField.caption,
            type: OperandType.TEXT,
            customField,
            buildQuery: (query, term) => {
              query[fieldId] = term.value;
            },
            parseQuery: (query, term) => {
              term.value = coerceToString(query[fieldId]);
            },
          };
        default:
          throw new Error(`Invalid custom field type: ${customField.type}`);
      }
    }
    return null;
  }
  return descriptors[fieldId];
}
