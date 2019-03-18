import * as React from 'react';
import {
  Project,
  PublicAccount,
  ProjectPrefs,
  ProjectContext,
  Subscription,
  Milestone,
  MilestoneStatus,
} from '../../../common/types/graphql';
import {
  Template,
  WorkflowState,
  Workflow,
  IssueType,
  FieldType,
} from '../../../common/types/json';
import { observable, ObservableSet, computed, action, autorun, IReactionDisposer } from 'mobx';
import gql from 'graphql-tag';
import { fragments, updateQueryResults } from '../graphql';
import { client } from '../graphql/client';
import bind from 'bind-decorator';
import { IssueQueryModel } from './IssueQueryModel';
import { ApolloError } from 'apollo-client';

export const ProjectEnv = React.createContext<ViewContext>(null);

const ProjectContextQuery = gql`
  query ProjectContextQuery($owner: String!, $name: String!) {
    projectContext(owner: $owner, name: $name) {
      project { ...ProjectFields }
      account { ...AccountFields }
      prefs { ...ProjectPrefsFields }
      milestones { ...MilestoneFields }
      template
    }
  }
  ${fragments.project}
  ${fragments.account}
  ${fragments.projectPrefs}
  ${fragments.milestone}
`;

interface ProjectContextQueryResult {
  projectContext: ProjectContext;
}

const PrefsChangeSubscription = gql`
  subscription PrefsChangeSubscription($project: ID!) {
    prefsChanged(project: $project) {
      action
      value { ...ProjectPrefsFields }
    }
  }
  ${fragments.projectPrefs}
`;

const MilestoneChangeSubscription = gql`
  subscription MilestoneChangeSubscription($project: ID!) {
    milestoneChanged(project: $project) {
      action
      value { ...MilestoneFields }
    }
  }
  ${fragments.milestone}
`;

type PrefsChangeResult = Pick<Subscription, 'prefsChanged'>;
type MilestoneChangeResult = Pick<Subscription, 'milestoneChanged'>;

const statusOrder = {
  [MilestoneStatus.Active]: 0,
  [MilestoneStatus.Pending]: 1,
  [MilestoneStatus.Timeless]: 2,
  [MilestoneStatus.Concluded]: 3,
};

function compareMilestones(m0: Milestone, m1: Milestone) {
  const s0 = statusOrder[m0.status];
  const s1 = statusOrder[m1.status];
  if (s0 < s1) {
    return -1;
  } else if (s0 > s1) {
    return 1;
  } else if (m0.startDate < m1.startDate) {
    return -1;
  } else if (m0.startDate > m1.startDate) {
    return 1;
  } else {
    return 0;
  }
}

/** A class that maintains references to all of the project-global objects used in the
    UI, including the project, template, prefs, labels and so on.
 */
export class ViewContext {
  @observable public projectName: string;
  @observable public accountName: string;
  @observable public loading = true;
  @observable public error: Partial<ApolloError> = null;
  @observable public project: Project = null;
  @observable public account: PublicAccount = null;
  @observable public template: Template = null;
  @observable public prefs: ProjectPrefs = null;
  @observable public milestones: Milestone[] = [];
  @observable public selection = new ObservableSet();
  @observable public mutationError: Error = null;
  public issues = new IssueQueryModel();

  private disposer: IReactionDisposer;
  private subscription: any;
  private unsubscribeHandles: Array<() => any> = [];

  constructor() {
    this.disposer = autorun(this.runQuery);
  }

  @action.bound
  public release() {
    this.disposer();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.unsubscribeHandles.forEach(handle => handle());
    this.unsubscribeHandles = [];
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

  @computed
  public get states(): Map<string, WorkflowState> {
    if (this.template) {
      return new Map(this.template.states.map(st => [st.id, st] as [string, WorkflowState]));
    } else {
      return new Map();
    }
  }

  @computed
  public get openStates(): Set<string> {
    if (this.template) {
      return new Set(this.template.states.filter(st => !st.closed).map(st => st.id));
    } else {
      return new Set();
    }
  }

  @computed
  public get fields(): Map<string, FieldType> {
    if (this.template) {
      const result = new Map<string, FieldType>();
      for (const type of this.template.types) {
        for (const field of (type.fields || [])) {
          result.set(field.id, field);
        }
      }
      return result;
    } else {
      return new Map();
    }
  }

  public getWorkflow(id: string): Workflow {
    return this.template.workflows.find(wf => wf.name === id);
  }

  public getWorkflowForType(typeId: string): Workflow {
    let type = this.template.types.find(ty => ty.id === typeId);
    while (type) {
      if (type.workflow) {
        return this.getWorkflow(type.workflow);
      }
      type = this.template.types.find(ty => ty.id === type.extends);
    }
    return null;
  }

  public getInheritedIssueType(id: string): IssueType {
    let iType: IssueType = this.template.types.find(ty => ty.id === id);
    if (iType) {
      if (iType.extends) {
        const base = this.getInheritedIssueType(iType.extends);
        if (base) {
          const fieldList: FieldType[] = Array.from(base.fields || []);
          if (iType.fields) {
            for (const field of iType.fields) {
              const index = fieldList.findIndex(f => f.id === field.id);
              if (index < 0) {
                fieldList.push(field);
              }
            }
          }
          iType = {
            ...base, ...iType, fields: fieldList,
          };
        }
      }
    }
    return iType;
  }

  @computed
  public get sortedMilestones(): Milestone[] {
    const sorted = [...this.milestones];
    sorted.sort(compareMilestones);
    return sorted;
  }

  public getMilestone(id: string): Milestone {
    return this.milestones.find(m => m.id === id);
  }

  @bind
  private runQuery() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.unsubscribeHandles.forEach(handle => handle());
    this.unsubscribeHandles = [];

    if (!this.projectName || !this.accountName) {
      this.project = null;
      this.account = null;
      this.template = null;
      this.prefs = null;
      this.milestones = [];
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
      this.error = errors ? { graphQLErrors: errors } : null;
      if (!this.loading && !this.error) {
        this.unsubscribeHandles.forEach(handle => handle());
        this.unsubscribeHandles = [
          queryResult.subscribeToMore<PrefsChangeResult>({
            document: PrefsChangeSubscription,
            variables: {
              project: data.projectContext.project.id,
            } as any,
            updateQuery: (prev, { subscriptionData }) => {
              return {
                projectContext: {
                  ...prev.projectContext,
                  prefs: subscriptionData.data.prefsChanged.value,
                }
              };
            },
          }),
          queryResult.subscribeToMore<MilestoneChangeResult>({
            document: MilestoneChangeSubscription,
            variables: {
              project: data.projectContext.project.id,
            } as any,
            updateQuery: (prev, { subscriptionData }) => {
              return {
                projectContext: {
                  ...prev.projectContext,
                  milestones: updateQueryResults(
                    prev.projectContext.milestones,
                    subscriptionData.data.milestoneChanged),
                }
              };
            },
          })
        ];

        this.update(data.projectContext);
      }
    }, error => {
      this.error = error;
    });
  }

  @action.bound
  private update(context: ProjectContext) {
    this.project = context.project;
    this.account = context.account;
    this.template = context.template;
    this.milestones = context.milestones;
    this.prefs = context.prefs;
  }
}
