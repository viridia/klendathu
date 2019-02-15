import { fragments } from '../graphql';
import { Issue, Project, IssueQueryParams } from '../../../common/types/graphql';
import { observable, IReactionDisposer, autorun, action, IObservableArray } from 'mobx';
import { client } from '../graphql/client';
import bind from 'bind-decorator';
import gql from 'graphql-tag';
import { GraphQLError } from 'graphql';

const IssuesQuery = gql`
  query IssuesQuery($query: IssueQueryParams!, $pagination: Pagination) {
    issues(query: $query, pagination: $pagination) { issues { ...IssueFields } }
  }
  ${fragments.issue}
`;

interface IssuesQueryResult {
  issues: {
    issues: Issue[];
  }
}

/** Reactive model class that represents a query over the issue table. */
export class IssueQueryModel {
  @observable public project: Project;
  @observable public loading = true;
  @observable public errors: ReadonlyArray<GraphQLError> = null;
  @observable.shallow public list: Issue[] = [];
  @observable public sort = 'id';
  @observable public descending = false;

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
  public setParams(project: Project) {
    this.project = project;
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

    if (!this.project) {
      this.list = [];
      return;
    }

    const query: IssueQueryParams = {
      project: this.project.id,
    };

    const queryResult = client.watchQuery<IssuesQueryResult>({
      query: IssuesQuery,
      variables: {
        query,
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
    this.list = issues;
  }
}
