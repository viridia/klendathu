import { fragments } from '../graphql';
import {
  Issue,
  Project,
  IssueQueryParams,
  Subscription,
  IssuesChangedSubscriptionArgs,
  Query,
  ChangeAction,
} from '../../../common/types/graphql';
import { observable, IReactionDisposer, autorun, action, computed, ObservableSet } from 'mobx';
import { client } from '../graphql/client';
import bind from 'bind-decorator';
import gql from 'graphql-tag';
import { GraphQLError } from 'graphql';
import { coerceToString, coerceToStringArray } from '../lib/coerce';
import { ObservableQuery, OperationVariables, ApolloQueryResult } from 'apollo-client';
import { idToIndex } from '../lib/idToIndex';

const IssuesQuery = gql`
  query IssuesQuery($query: IssueQueryParams!, $pagination: Pagination) {
    issues(query: $query, pagination: $pagination) { issues { ...IssueFields } }
  }
  ${fragments.issue}
`;

const IssuesSubscription = gql`
  subscription IssuesQuery($project: ID!) {
    issuesChanged(project: $project) {
      action
      value { ...IssueFields }
    }
  }
  ${fragments.issue}
`;

type IssuesQueryResult = Pick<Query, 'issues'>;
type IssueChangeResult = Pick<Subscription, 'issuesChanged'>;
interface SearchParams { [param: string]: string | string[]; }

/** Reactive model class that represents a query over the issue table. */
export class IssueQueryModel {
  @observable public loading = true;
  @observable public errors: ReadonlyArray<GraphQLError> = null;
  @observable.shallow public list: Issue[] = [];
  @observable public searchParams: SearchParams = {};
  @observable public sort = 'id';
  @observable public descending = false;
  @observable public recentlyAdded = new Set<string>() as ObservableSet<string>;

  @observable private projectId: string = null;
  private disposer: IReactionDisposer;
  private sDisposer: IReactionDisposer;
  private queryResult: ObservableQuery<IssuesQueryResult, OperationVariables>;
  private querySubscription: any;
  private subscription: any;

  constructor() {
    this.disposer = autorun(this.runQuery);
    this.sDisposer = autorun(this.runSubscription);
  }

  @action.bound
  public release() {
    this.disposer();
    this.sDisposer();
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }

  @action
  public setQueryArgs(project: Project, queryParams: SearchParams) {
    this.projectId = project ? project.id : null;
    this.searchParams = queryParams;
    const sort = coerceToString(this.searchParams.sort);
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

  public adjacentIssueIds(id: string): [string, string] {
    const index = this.list.findIndex(issue => issue.id === id);
    if (index < 0) {
      return [null, null];
    }
    return [
      index > 0 ? idToIndex(this.list[index - 1].id) : null,
      index < this.list.length - 1 ? idToIndex(this.list[index + 1].id) : null,
    ];
  }

  @bind
  private runQuery() {
    if (!this.projectId) {
      if (this.querySubscription) {
        this.querySubscription.unsubscribe();
        this.querySubscription = null;
        this.queryResult = null;
      }
      this.list = [];
      return;
    }

    if (this.queryResult) {
      this.queryResult.refetch({
        query: this.issueQuery,
      });
      return;
    }

    this.queryResult = client.watchQuery<IssuesQueryResult>({
      query: IssuesQuery,
      variables: {
        query: this.issueQuery,
      }
    });

    this.querySubscription = this.queryResult.subscribe(result => {
      const { data, loading, errors } = result;
      this.loading = loading;
      this.errors = errors;
      if (!this.loading && !this.errors) {
        this.update(data.issues.issues);
      }
    });
  }

  @bind
  private runSubscription() {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }

    if (this.projectId) {
      this.subscription = client
        .subscribe<ApolloQueryResult<IssueChangeResult>, IssuesChangedSubscriptionArgs>({
          query: IssuesSubscription,
          variables: {
            project: this.projectId,
          },
      }).subscribe(({ errors, data }) => {
        if (errors) {
          this.errors = errors;
        } else {
          if (data.issuesChanged.action === ChangeAction.Added) {
            this.recentlyAdded.replace([data.issuesChanged.value.id]);
          }
          // console.log(data);
          if (this.querySubscription) {
            this.queryResult.refetch();
          }
        }
      });
    }
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

    if ('state' in this.searchParams) {
      issueQuery.state = coerceToStringArray(this.searchParams.state);
    }

    if ('type' in this.searchParams) {
      issueQuery.type = coerceToStringArray(this.searchParams.type);
    }

    if ('owner' in this.searchParams) {
      issueQuery.owner = coerceToStringArray(this.searchParams.owner);
    }

    // console.debug('sort:', this.sort, 'descending:', this.descending);

    // this.query.labels = coerceToNumberArray(queryParams.label);

    // this.filterParams = {};
    // this.filterParams.search = queryParams.search;
    // this.group = queryParams.group;
    // for (const key of Object.getOwnPropertyNames(this.searchParams)) {
    //   if (key in descriptors || key.startsWith('custom.') || key.startsWith('pred.')) {
    //     const desc = descriptors[key];
    //     let value: any = this.searchParams[key];
    //     if (desc && desc.type === OperandType.USER && value === 'me') {
    //       value = session.account.accountName;
    //     // } else if (desc && desc.type === OperandType.STATE_SET && value === 'open') {
    //     //   value = project.template.states.filter(st => !st.closed).map(st => st.id);
    //     }
    //     issueQuery[key] = value;
    //   }
    // }

    return issueQuery;
  }

  @computed
  private get search(): string {
    return coerceToString(this.searchParams.search);
  }

  @computed
  private get labels(): string[] {
    const labels = coerceToStringArray(this.searchParams.label);
    if (labels && labels.length > 0) {
      return labels.map(l => `${this.projectId}.${l}`);
    }
    return undefined;
  }
}
