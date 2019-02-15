import * as React from 'react';
import { IssueListQuery } from '../../../models';
import { searchIssues } from '../../../network/requests';
import bind from 'bind-decorator';
import { Issue, Project } from '../../../../common/types/graphql';
import { Autocomplete, SearchCallback } from '../../controls';

interface Props {
  className?: string;
  placeholder?: string;
  project: Project;
  issues: IssueListQuery;
  exclude?: string;
  selection: Issue | Issue[];
  onSelectionChange: (selection: Issue | Issue[] | null) => void;
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
  private onSearch(token: string, callback: SearchCallback<Issue>) {
    if (token.length < 1) {
      callback([]);
    } else {
      const { project } = this.props;
      this.token = token;
      searchIssues(project.account, project.name, token, issues => {
        if (this.token === token) {
          callback(issues.filter(issue => issue.id !== this.props.exclude));
        }
      });
    }
  }

  @bind
  private onRenderSuggestion(issue: Issue) {
    return (
      <span className="issue-ref">
        <span className="id">#{issue.id.split('/')[2]}: </span>
        <span className="summary">{issue.summary}</span>
      </span>
    );
  }

  @bind
  private onRenderSelection(issue: Issue) {
    return this.onRenderSuggestion(issue);
  }

  @bind
  private onGetValue(issue: Issue) {
    return issue.id;
  }

  @bind
  private onGetSortKey(issue: Issue) {
    return issue.summary;
    // return -issue.score;
  }
}
