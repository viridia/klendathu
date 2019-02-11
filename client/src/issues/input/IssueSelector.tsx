import * as React from 'react';
import { Issue as IssueData } from 'klendathu-json-types';
import { IssueListQuery, Project } from '../../../models';
import { Autocomplete, SearchCallback } from '../../ac/Autocomplete';
import { searchIssues } from '../../../network/requests';
import bind from 'bind-decorator';

interface Props {
  className?: string;
  placeholder?: string;
  project: Project;
  issues: IssueListQuery;
  exclude?: string;
  selection: IssueData | IssueData[];
  onSelectionChange: (selection: IssueData | IssueData[] | null) => void;
}

export class IssueSelector extends React.Component<Props> {
  private token: string;

  public render() {
    return (
      <Autocomplete
          {...this.props}
          onSearch={this.onSearch}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onRenderSelection={this.onRenderSelection}
      />
    );
  }

  @bind
  private onSearch(token: string, callback: SearchCallback<IssueData>) {
    if (token.length < 1) {
      callback([]);
    } else {
      const { project } = this.props;
      this.token = token;
      searchIssues(project.account, project.uname, token, issues => {
        if (this.token === token) {
          callback(issues.filter(issue => issue.id !== this.props.exclude));
        }
      });
    }
  }

  @bind
  private onRenderSuggestion(issue: IssueData) {
    return (
      <span className="issue-ref">
        <span className="id">#{issue.id.split('/')[2]}: </span>
        <span className="summary">{issue.summary}</span>
      </span>
    );
  }

  @bind
  private onRenderSelection(issue: IssueData) {
    return this.onRenderSuggestion(issue);
  }

  @bind
  private onGetValue(issue: IssueData) {
    return issue.id;
  }

  @bind
  private onGetSortKey(issue: IssueData) {
    return issue.summary;
    // return -issue.score;
  }
}
