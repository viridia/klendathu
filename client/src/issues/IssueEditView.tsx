import * as React from 'react';
import { IssueListQuery, ObservableIssue, Project, MilestoneListQuery } from '../../models';
import { RouteComponentProps } from 'react-router-dom';
import { IssueProvider } from './IssueProvider';
import { updateIssue } from '../../network/requests';
import { IssueCompose } from './IssueCompose';
import { Account, IssueInput } from 'klendathu-json-types';
import { toast } from 'react-toastify';

interface Props extends RouteComponentProps<{ project: string; id: string }> {
  account: Account;
  project: Project;
  issues: IssueListQuery;
  milestones: MilestoneListQuery;
}

export class IssueEditView extends React.Component<Props> {
  public render() {
    return (
      <IssueProvider {...this.props}>
        {(issue: ObservableIssue) => {
          const onSave = (input: IssueInput) => this.onSave(issue, input);
          return <IssueCompose {...this.props} issue={issue} onSave={onSave} />;
        }}
      </IssueProvider>
    );
  }

  private onSave(issue: ObservableIssue, input: IssueInput): Promise<any> {
    return updateIssue(issue.id, input).then(resp => {
      toast.success(`Issue #${issue.index} updated.`);
    });
  }
}
