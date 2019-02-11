import { accounts } from './AccountStore';
import { session } from './Session';
import { OperandType, defaultOperandValue } from './OperandType';
// import { ObservableSet } from './ObservableSet';
// import { Account, DataType, FieldType, Predicate } from 'klendathu-json-types';
import { FilterTerm } from './FilterTerm';
import { FieldType, DataType } from '../../../common/types/json';
import { Project, Predicate, PublicAccount } from '../../../common/types/graphql';
import { ObservableSet } from '../lib/ObservableSet';

interface Query {
  [key: string]: string | string[];
}

function toScalar(value: string | string[]): string {
  if (typeof value === 'string') {
    return value;
  } else {
    return value[0];
  }
}

function toArray(value: string | string[]): string[] {
  if (typeof value === 'string') {
    return [value];
  } else {
    return value;
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
  parseQuery: (query: Query, term: FilterTerm, project: Project) => void;
}

export const descriptors: { [type: string]: FilterTermDescriptor } = {
  state: {
    caption: 'State',
    type: OperandType.STATE_SET,
    buildQuery: (query, term) => {
      if (term.value) {
        const states: ObservableSet = term.value;
        query.state = states.values;
      }
    },
    parseQuery(query, term, project) {
      const state = query.state;
      term.value = state === 'open'
        ? defaultOperandValue(project.template, OperandType.STATE_SET, null)
        : new ObservableSet(toArray(state));
    },
  },
  type: {
    caption: 'Type',
    type: OperandType.TYPE_SET,
    buildQuery: (query, term) => {
      if (term.value) {
        const types: ObservableSet = term.value;
        query.type = types.values;
      }
    },
    parseQuery(query, term, project) {
      const type = query.type;
      term.value = new ObservableSet(toArray(type));
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
    parseQuery(query, term, project) {
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
    parseQuery(query, term, project) {
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
    parseQuery(query, term, project) {
      term.value = null;
      if (query.reporter) {
        accounts.byName(toScalar(query.reporter)).then(account => {
          term.value = account;
        });
      }
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
    parseQuery(query, term, project) {
      term.value = null;
      if (query.owner) {
        if (query.owner === 'me') {
          term.value = session.account;
        } else {
          accounts.byName(toScalar(query.owner)).then(account => {
            term.value = account;
          });
        }
      }
    },
  },
  cc: {
    caption: 'CC',
    type: OperandType.USERS,
    buildQuery: (query, term) => {
      if (term.value) {
        query.cc = term.value.map((account: Account) => account.uname);
      }
    },
    parseQuery(query, term, project) {
      term.value = [];
      if (typeof query.cc === 'string') {
        const accountNames = toArray(query.cc);
        const promises = accountNames
            .map((uname: string) => accounts.byName(uname).catch(() => null));
        Promise.all(promises).then(users => {
          term.value = users.filter(u => u);
        });
      }
    }
  },
  labels: {
    caption: 'Labels',
    type: OperandType.LABEL,
    buildQuery: (query, term) => {
      if (term.value) {
        const labels: string[] = term.value;
        query.labels = labels.map(l => l.split('/')[2]);
      }
    },
    parseQuery(query, term, project) {
      term.value = [];
      if (typeof query.labels === 'string') {
        term.value = toArray(query.labels).map(n => `${project.account}/${project.uname}/${n}`);
      }
    }
  },
};

export function getDescriptor(project: Project, fieldId: string): FilterTermDescriptor {
  if (fieldId && fieldId.startsWith('custom.')) {
    const id = fieldId.slice(7);
    const customField = project.template.fields.get(id);
    if (customField) {
      switch (customField.type) {
        case DataType.ENUM: {
          return {
            caption: customField.caption,
            type: OperandType.ENUM,
            customField,
            buildQuery: (query, term) => {
              if (term.value) {
                query[fieldId] = (term.value as ObservableSet).values;
                query[`pred.${id}`] = Predicate.IN;
              }
            },
            parseQuery: (query, term) => {
              term.value = new ObservableSet(toArray(query[fieldId]));
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
              term.value = toScalar(query[fieldId]);
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
