import { fragments, queryAccount } from '../graphql';
import {
  Issue,
  Project,
  IssueQueryParams,
  Subscription,
  IssuesChangedSubscriptionArgs,
  Query,
  ChangeAction,
  Predicate,
} from '../../../common/types/graphql';
import { observable, IReactionDisposer, autorun, action, ObservableSet } from 'mobx';
import { client } from '../graphql/client';
import { GraphQLError } from 'graphql';
import { coerceToString, coerceToStringArray } from '../lib/coerce';
import { ObservableQuery, OperationVariables, ApolloQueryResult } from 'apollo-client';
import { idToIndex } from '../lib/idToIndex';
import { session } from './Session';
import bind from 'bind-decorator';
import gql from 'graphql-tag';
import { WorkflowState } from '../../../common/types/json';

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

function resolveAccountName(name: string): Promise<string> {
  if (name === 'none') {
    return Promise.resolve('none');
  } else if (name === 'me') {
    return Promise.resolve(session.account.id);
  }

  return queryAccount({ accountName: name }).then(({ data }) => {
    return data ? data.account.id : undefined;
  });
}

type IssuesQueryResult = Pick<Query, 'issues'>;
type IssueChangeResult = Pick<Subscription, 'issuesChanged'>;
interface SearchParams { [param: string]: string | string[]; }

/** Reactive model class that represents a query over the issue table. */
export class IssueQueryModel {
  public searchParams: SearchParams;
  @observable public loading = true;
  @observable public errors: ReadonlyArray<GraphQLError> = null;
  @observable.shallow public list: Issue[] = [];
  @observable public sort = 'id';
  @observable public descending = false;
  @observable public recentlyAdded = new Set<string>() as ObservableSet<string>;

  @observable private projectId: string = null;
  @observable private issueQuery: IssueQueryParams = { project: null };
  private disposer: IReactionDisposer;
  private sDisposer: IReactionDisposer;
  private queryResult: ObservableQuery<IssuesQueryResult, OperationVariables>;
  private querySubscription: any;
  private subscription: ZenObservable.Subscription;

  constructor() {
    this.disposer = autorun(this.runQuery, { delay: 50 });
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
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  @action
  public setQueryArgs(
      project: Project,
      states: Map<string, WorkflowState>,
      queryParams: SearchParams) {
    this.searchParams = queryParams;

    // Resolve account names
    Promise.all([
      Promise.all(coerceToStringArray(queryParams.reporter).map(resolveAccountName)),
      Promise.all(coerceToStringArray(queryParams.owner).map(resolveAccountName)),
      Promise.all(coerceToStringArray(queryParams.cc).map(resolveAccountName)),
    ]).then(([ reporters, owners, ccs ]) => {
      // Compute query parameters to send to server
      this.projectId = project ? project.id : null;
      const issueQuery: IssueQueryParams = {
        project: this.projectId,
        labels: [],
        reporter: reporters.filter(acc => acc),
        owner: owners.filter(acc => acc),
        cc: ccs.filter(acc => acc),
      };

      if ('search' in queryParams) {
        issueQuery.search = coerceToString(queryParams.search);
      }

      if ('state' in queryParams) {
        issueQuery.state =
            queryParams.state === 'open'
            ? Array.from(states.values()).filter(st => !st.closed).map(st => st.id)
            : coerceToStringArray(queryParams.state);
      }

      if ('type' in queryParams) {
        issueQuery.type = coerceToStringArray(queryParams.type);
      }

      if ('summary' in queryParams) {
        issueQuery.summary = coerceToString(queryParams.summary);
        issueQuery.summaryPred =
            coerceToString(queryParams.summaryPred) as Predicate || Predicate.Contains;
      }

      if ('description' in queryParams) {
        issueQuery.description = coerceToString(queryParams.description);
        issueQuery.summaryPred =
            coerceToString(queryParams.descriptionPred) as Predicate || Predicate.Contains;
      }

      if ('label' in queryParams) {
        issueQuery.labels = coerceToStringArray(queryParams.label)
            .map(l => `${this.projectId}.${l}`);
      }

      // TODO: Custom fields
      // this.group = queryParams.group;
      // for (const key of Object.getOwnPropertyNames(this.searchParams)) {
      //   if (key in descriptors || key.startsWith('custom.') || key.startsWith('pred.')) {
      //     const desc = descriptors[key];
      //     let value: any = this.searchParams[key];
      //     issueQuery[key] = value;
      //   }
      // }

      const sort = coerceToString(queryParams.sort);
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
        this.descending = false;
      }

      issueQuery.sort = sort ? [sort] : null;
      this.issueQuery = issueQuery;
    });
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
    if (!this.issueQuery.project) {
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
      this.subscription.unsubscribe();
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
}
