import * as React from 'react';
import { IssueListQuery, issues, ObservableIssue, Project } from '../../models';
import { Account } from 'klendathu-json-types';
import { RouteComponentProps } from 'react-router-dom';
import { observable } from 'mobx';

export interface IssueProviderProps extends RouteComponentProps<{ project: string, id: string }> {
  account: Account;
  project: Project;
  issues: IssueListQuery;
  children: (issue: ObservableIssue) => React.ReactNode;
}

export class IssueProvider extends React.Component<IssueProviderProps> {
  @observable.ref private issue: ObservableIssue;

  public componentWillMount() {
    const { account } = this.props;
    const { project, id } = this.props.match.params;
    const issueId = `${account.uid}/${project}/${id}`;
    this.issue = issues.get(issueId);
  }

  public componentWillReceiveProps(nextProps: IssueProviderProps) {
    const { account } = nextProps;
    const { project, id } = nextProps.match.params;
    const issueId = `${account.uid}/${project}/${id}`;
    if (issueId !== this.issue.id) {
      this.issue.release();
      this.issue = issues.get(issueId);
    }
  }

  public componentWillUnmount() {
    this.issue.release();
  }

  public render() {
    const { children } = this.props;
    return this.issue ? children(this.issue) : null;
  }
}
