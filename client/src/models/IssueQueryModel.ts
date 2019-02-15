import { fragments } from '../graphql';
import { Issue, Project, IssueQueryParams } from '../../../common/types/graphql';
import { observable, IReactionDisposer, autorun, action, computed } from 'mobx';
import { client } from '../graphql/client';
import bind from 'bind-decorator';
import gql from 'graphql-tag';
import { GraphQLError } from 'graphql';

function coerceToString(param: string | string[]): string {
  if (!param) {
    return undefined;
  } else if (typeof param === 'string') {
    return param;
  } else if (Array.isArray(param)) {
    return param[0];
  } else {
    return undefined;
  }
}

function coerceToStringArray(param: string | string[]): string[] {
  if (!param) {
    return undefined;
  } else if (typeof param === 'string') {
    return [param];
  } else if (Array.isArray(param)) {
    return param;
  } else {
    return undefined;
  }
}

const IssuesQuery = gql`
  query IssuesQuery($query: IssueQueryParams!, $pagination: Pagination) {
    issues(query: $query, pagination: $pagination) { issues { ...IssueFields } }
  }
  ${fragments.issue}
`;

interface IssuesQueryResult {
  issues: {
    issues: Issue[];
  };
}

interface QueryParams { [param: string]: string | string[]; }

/** Reactive model class that represents a query over the issue table. */
export class IssueQueryModel {
  @observable public loading = true;
  @observable public errors: ReadonlyArray<GraphQLError> = null;
  @observable.shallow public list: Issue[] = [];
  @observable public query: QueryParams = {};
  @observable public sort = 'id';
  @observable public descending = false;

  @observable private projectId: string = null;
  private disposer: IReactionDisposer;
  private subscription: any;

  constructor() {
    this.disposer = autorun(this.runQuery);
  }

  @action.bound
  public release() {
    this.disposer();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // if (this.unsubscribeHandle) {
    //   this.unsubscribeHandle();
    //   this.unsubscribeHandle = null;
    // }
  }

  @action
  public setQueryArgs(project: Project, queryParams: QueryParams) {
    this.projectId = project ? project.id : null;
    this.query = queryParams;
    const sort = coerceToString(this.query.sort);
    if (sort) {
      if (sort.startsWith('-')) {
        this.sort = sort.slice(1);
        this.descending = true;
      } else {
        this.sort = sort;
        this.descending = false;
      }
    } else {
      this.sort = 'id';
      this.descending = true;
    }
  }

  @bind
  private runQuery() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    // if (this.unsubscribeHandle) {
    //   this.unsubscribeHandle();
    //   this.unsubscribeHandle = null;
    // }

    if (!this.projectId) {
      this.list = [];
      return;
    }

    const queryResult = client.watchQuery<IssuesQueryResult>({
      query: IssuesQuery,
      variables: {
        query: this.issueQuery,
      }
    });

    this.subscription = queryResult.subscribe(result => {
      const { data, loading, errors } = result;
      this.loading = loading;
      this.errors = errors;
      if (!this.loading && !this.errors) {
        // if (this.unsubscribeHandle) {
        //   this.unsubscribeHandle();
        //   this.unsubscribeHandle = null;
        // }

        // this.unsubscribeHandle = queryResult.subscribeToMore<PrefsChangeResult>({
        //   document: PrefsChangeSubscription,
        //   variables: {
        //     project: data.projectContext.project.id,
        //   } as any,
        //   updateQuery: (prev, { subscriptionData }) => {
        //     return {
        //       projectContext: {
        //         ...prev.projectContext,
        //         prefs: subscriptionData.data.prefsChanged.prefs,
        //       }
        //     };
        //   },
        // });

        this.update(data.issues.issues);
      }
    });
  }

  @action
  private update(issues: Issue[]) {
    this.list = issues.slice();
  }

  @computed
  private get issueQuery(): IssueQueryParams {
    const issueQuery: IssueQueryParams = {
      project: this.projectId,
      search: this.search,
      labels: this.labels,
    };

    // console.debug('sort:', this.sort, 'descending:', this.descending);

    // this.query.labels = coerceToNumberArray(queryParams.label);

    // this.filterParams = {};
    // this.filterParams.search = queryParams.search;
    // this.group = queryParams.group;
    // for (const key of Object.getOwnPropertyNames(queryParams)) {
    //   if (key in descriptors || key.startsWith('custom.') || key.startsWith('pred.')) {
    //     const desc = descriptors[key];
    //     let value: any = queryParams[key];
    //     if (desc && desc.type === OperandType.USER && value === 'me') {
    //       value = session.account.uname;
    //     } else if (desc && desc.type === OperandType.STATE_SET && value === 'open') {
    //       value = project.template.states.filter(st => !st.closed).map(st => st.id);
    //     }
    //     this.filterParams[key] = value;
    //   }
    // }

    return issueQuery;
  }

  @computed
  private get search(): string {
    return coerceToString(this.query.search);
  }

  @computed
  private get labels(): string[] {
    const labels = coerceToStringArray(this.query.label);
    if (labels) {
      return labels.map(l => `${this.projectId}.${l}`);
    }
    return;
  }
}
