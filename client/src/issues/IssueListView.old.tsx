import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { GroupHeader } from './GroupHeader';
import { IssueListEntry } from './IssueListEntry';
// import { MassEdit } from '../massedit/MassEdit';
// import { FilterParams } from '../filters/FilterParams';
import { observer } from 'mobx-react';
import { Issue, PublicAccount } from '../../../common/types/graphql';

import MenuIcon from '../../../icons/ic_menu.svg';

interface Props extends RouteComponentProps<{}> {
  account: PublicAccount;
  // project: Project;
  // prefs: ObservableProjectPrefs;
  // issues: IssueListQuery;
}

interface QueryParams { [param: string]: string; }

@observer
export class IssueListView extends React.Component<Props> {

  public render() {
    const { account, issues, project } = this.props;
    if (!account) {
      return null;
    }
    if (!issues.loaded || !project.template.loaded) {
      return (
        <section className="kdt content issue-list">
          <div className="card issue">
            <div className="empty-list">Loading&hellip;</div>
          </div>
        </section>
      );
    } else if (issues.length === 0) {
      return (
        <section className="kdt content issue-list">
          {/* <FilterParams {...this.props} /> */}
          <div className="card issue">
            <div className="empty-list">No issues found</div>
          </div>
        </section>
      );
    } else {
      return (
        <section className="kdt content issue-list">
          {/* <FilterParams {...this.props} />
          <MassEdit project={project} selection={this.selection} /> */}
          {this.renderIssues()}
        </section>
      );
    }
  }

  private renderIssues() {
    const { issues, project } = this.props;
    if (issues.group) {
      return issues.grouped.map(gr => (
        <section className="issue-group" key={gr.value}>
          <header className="group-header">
            <GroupHeader group={gr} project={project} />
          </header>
          {this.renderIssueTable(gr.issues)}
        </section>
      ));
    }
    return this.renderIssueTable(issues.sorted);
  }

  private renderIssueTable(issues: Issue[]) {
    return (
      <div className="card issue">
        <table className="issue">
          {this.renderHeader()}
          <tbody>
            {issues.map(issue => (
              <IssueListEntry
                  {...this.props}
                  key={issue.id}
                  issue={issue}
                  columnRenderers={this.columnRenderers}
                  selection={this.selection}
              />))}
          </tbody>
        </table>
      </div>
    );
  }

}
