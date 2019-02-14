import * as React from 'react';
// import { IssueListQuery, Project, MilestoneListQuery } from '../../models';
import { RouteComponentProps } from 'react-router-dom';
// import { createIssue } from '../../network/requests';
import { IssueCompose } from './IssueCompose';
// import { toast } from 'react-toastify';
import bind from 'bind-decorator';
import { IssueInput } from '../../../common/types/graphql';
import { ViewContext } from '../models';
// import { Account, IssueInput } from 'klendathu-json-types';

interface Props extends RouteComponentProps<{}> {
  context: ViewContext;
  // issues: IssueListQuery;
  // milestones: MilestoneListQuery;
}

export class IssueCreateView extends React.Component<Props> {
  public render() {
    return <IssueCompose {...this.props} onSave={this.onSave} />;
  }

  @bind
  private onSave(input: IssueInput): Promise<any> {
    // const { project } = this.props;
    // return createIssue(project.owner, project.name, input).then(resp => {
    //   toast.success(`Issue #${resp.id.split('/')[2]} created.`);
    // });
    return null;
  }
}
