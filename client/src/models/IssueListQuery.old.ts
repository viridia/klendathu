import { session } from './Session';
// import { descriptors } from './FilterTermDescriptor';
// import { OperandType } from './OperandType';
import { Project } from './Project';
import { action, computed, ObservableMap, observe, observable } from 'mobx';
import bind from 'bind-decorator';
import * as qs from 'qs';
import { Issue } from '../../../common/types/graphql';

function alphabeticalSort(a: any, b: any) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  if (a === undefined && b !== undefined) {
    return -1;
  }
  if (b === undefined && a !== undefined) {
    return 1;
  }
  if (a === null && b !== null) {
    return -1;
  }
  if (b === null && a !== null) {
    return 1;
  }
  return 0;
}

type Comparator = (a: Issue, b: Issue) => number;

function alphabeticalSortOrder(field: string, descending: boolean): Comparator {
  if (descending) {
    return (a: Issue, b: Issue) => -alphabeticalSort((a as any)[field], (b as any)[field]);
  } else {
    return (a: Issue, b: Issue) => alphabeticalSort((a as any)[field], (b as any)[field]);
  }
}

function customSortOrder(field: string, descending: boolean): Comparator {
  if (descending) {
    return (a: Issue, b: Issue) =>
      -alphabeticalSort((a.custom as any || {})[field], (b.custom as any || {})[field]);
  } else {
    return (a: Issue, b: Issue) =>
      alphabeticalSort((a.custom as any || {})[field], (b.custom as any || {})[field]);
  }
}

/** A group of issues having some property in common. */
export interface IssueGroup {
  /** what field we are grouping on. */
  field: string;

  /** Used in ordering the groups. */
  sortKey: string;

  /** Display value. */
  value: string;

  /** List of issues. */
  issues: Issue[];
}

export class IssueListQuery {
  @observable public loaded = false;
  @observable public error: string = null;
  @observable public sort: string = 'id';
  @observable public group: string = '';
  @observable public descending: boolean = true;
  @observable private filterParams: { [key: string]: any } = {};
  @observable.shallow private issues = new ObservableMap<Issue>();
  private account: string;
  private project: string;

  constructor(account: string, project: string) {
    this.account = account;
    this.project = project;
    // observe(this, 'queryParams', this.onChangeQueryParams, true);
  }

  public release() {
    // this.record.unsubscribe(this.onUpdate);
    // this.record.discard();
  }

  public get(id: string) {
    return this.issues.get(id);
  }

  public get length(): number {
    return this.issues.size;
  }

  public get asList(): Issue[] {
    // return this.issues.values();
  }

  @computed
  public get sorted(): Issue[] {
    const result = [...this.issues.values()];
    result.sort(this.comparator);
    return result;
  }

  @computed
  public get grouped(): IssueGroup[] {
    const groupMap = new Map<string, IssueGroup>();
    let fieldName = this.group;
    if (this.group === 'owner') {
      fieldName = 'ownerSort';
    } else if (this.group === 'reporter') {
      fieldName = 'reporterSort';
    }
    for (const issue of this.sorted) {
      const value = (issue as any)[this.group];
      const sortKey = (issue as any)[fieldName];
      const group = groupMap.get(sortKey);
      if (!group) {
        groupMap.set(sortKey, { field: this.group, sortKey, value, issues: [issue] });
      } else {
        group.issues.push(issue);
      }
    }
    const keys = [...groupMap.keys()];
    keys.sort(alphabeticalSort);
    return keys.map(key => groupMap.get(key));
  }

  @computed
  public get comparator(): Comparator {
    if (this.sort.startsWith('custom.')) {
      return customSortOrder(this.sort.slice(7), this.descending);
    }
    if (this.sort === 'owner') {
      return alphabeticalSortOrder('ownerSort', this.descending);
    }
    if (this.sort === 'reporter') {
      return alphabeticalSortOrder('reporterSort', this.descending);
    }
    return alphabeticalSortOrder(this.sort, this.descending);
  }

  @action
  public setFromQuery(project: Project, queryParams: { [param: string]: string; }) {
    if (queryParams.sort) {
      if (queryParams.sort.startsWith('-')) {
        this.sort = queryParams.sort.slice(1);
        this.descending = true;
      } else {
        this.sort = queryParams.sort;
        this.descending = false;
      }
    } else {
      this.sort = 'id';
      this.descending = true;
    }

    this.filterParams = {};
    this.filterParams.search = queryParams.search;
    this.group = queryParams.group;
    for (const key of Object.getOwnPropertyNames(queryParams)) {
      if (key in descriptors || key.startsWith('custom.') || key.startsWith('pred.')) {
        const desc = descriptors[key];
        let value: any = queryParams[key];
        if (desc && desc.type === OperandType.USER && value === 'me') {
          value = session.account.uname;
        } else if (desc && desc.type === OperandType.STATE_SET && value === 'open') {
          value = project.template.states.filter(st => !st.closed).map(st => st.id);
        }
        this.filterParams[key] = value;
      }
    }
  }

  // These are the query params that are sent to the API.
  @computed
  private get queryParams(): string {
    const query: any = { ...this.filterParams };
    return qs.stringify(query, {
      addQueryPrefix: true,
      sort: alphabeticalSort,
      encoder: encodeURI,
      arrayFormat: 'repeat',
    });
  }

  @action.bound
  private onUpdate(data: { [id: string]: Issue }) {
    this.issues.replace(
      Object.getOwnPropertyNames(data)
          .map(id => [id, data[id]] as [string, Issue])
          .filter(v => v[1]));
    this.loaded = true;
  }

  @bind
  private onChangeQueryParams() {
    if (this.record) {
      this.release();
    }
    const newList = session.connection.record.getRecord(
      `issues/${this.account}/${this.project}${this.queryParams}`);
    this.record = newList;
    this.record.subscribe(this.onUpdate, true);
  }
}
