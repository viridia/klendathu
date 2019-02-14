import {
  Project,
  PublicAccount,
  ProjectPrefs,
  ProjectContext,
  ProjectPrefsChange,
} from '../../../common/types/graphql';
import { Template } from '../../../common/types/json';
import { observable, ObservableSet, computed, action, autorun, IReactionDisposer } from 'mobx';
import gql from 'graphql-tag';
import { fragments } from '../graphql';
import { client } from '../graphql/client';
import bind from 'bind-decorator';
import { GraphQLError } from 'graphql';

const ProjectContextQuery = gql`
  query ProjectContextQuery($owner: String!, $name: String!) {
    projectContext(owner: $owner, name: $name) {
      project { ...ProjectFields }
      account { ...AccountFields }
      prefs { ...ProjectPrefsFields }
      template
    }
  }
  ${fragments.project}
  ${fragments.account}
  ${fragments.projectPrefs}
`;

interface ProjectContextQueryResult {
  projectContext: ProjectContext;
}

const PrefsChangeSubscription = gql`
  subscription PrefsChangeSubscription($project: ID!) {
    prefsChanged(project: $project) {
      action
      prefs { ...ProjectPrefsFields }
    }
  }
  ${fragments.projectPrefs}
`;

interface PrefsChangeResult {
  prefsChanged: ProjectPrefsChange;
}

/** A class that maintains references to all of the project-global objects used in the
    UI, including the project, template, prefs, labels and so on.
 */
export class ViewContext {
  @observable public projectName: string;
  @observable public accountName: string;
  @observable public loading = true;
  @observable public errors: ReadonlyArray<GraphQLError> = null;
  @observable public project: Project = null;
  @observable public account: PublicAccount = null;
  @observable public template: Template = null;
  @observable public prefs: ProjectPrefs = null;

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
  }

  @action.bound
  public setParams(accountName: string, projectName: string) {
    this.accountName = accountName;
    this.projectName = projectName;
  }

  @action.bound
  public reset() {
    this.accountName = null;
    this.projectName = null;
  }

  @computed
  public get visibleLabels(): ObservableSet<string> {
    if (this.prefs) {
      return new ObservableSet(this.prefs.labels);
    } else {
      return new ObservableSet();
    }
  }

  @bind
  private runQuery() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (!this.projectName || !this.accountName) {
      this.project = null;
      this.account = null;
      this.template = null;
      this.prefs = null;
      return;
    }

    const queryResult = client.watchQuery<ProjectContextQueryResult>({
      query: ProjectContextQuery,
      variables: {
        owner: this.accountName,
        name: this.projectName,
      },
    });

    this.subscription = queryResult.subscribe(result => {
      const { data, loading, errors } = result;
      this.loading = loading;
      this.errors = errors;
      if (!this.loading && !this.errors) {
        queryResult.subscribeToMore<PrefsChangeResult>({
          document: PrefsChangeSubscription,
          variables: {
            project: data.projectContext.project.id,
          } as any,
          updateQuery: (prev, { subscriptionData }) => {
            return {
              projectContext: {
                ...prev.projectContext,
                prefs: subscriptionData.data.prefsChanged.prefs,
              }
            };
          },
        });

        this.update(data.projectContext);
      }
    });
  }

  @action.bound
  private update(context: ProjectContext) {
    this.project = context.project;
    this.account = context.account;
    this.template = context.template;
    this.prefs = context.prefs;
  }
}
