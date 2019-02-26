import * as React from 'react';
import { Issue, Query } from '../../../../common/types/graphql';
import { Autocomplete, SearchCallback } from '../../controls';
import { ViewContext } from '../../models';
import { client } from '../../graphql/client';
import { fragments } from '../../graphql';
import { styled } from '../../style';
import { idToIndex } from '../../lib/idToIndex';
import bind from 'bind-decorator';
import gql from 'graphql-tag';

type IssuesQueryResult = Pick<Query, 'issues'>;

const IssuesSearchQuery = gql`
  query IssuesSearchQuery($query: IssueQueryParams!, $pagination: Pagination) {
    issues(query: $query, pagination: $pagination) { issues { ...IssueFields } }
  }
  ${fragments.issue}
`;

const IssueSuggestion = styled.div`
  display: inline-block;
  white-space: nowrap;
  > .id {
    font-weight: bold;
  }
`;

const IssueAutocomplete = styled(Autocomplete)`
  min-width: 0;

  > .ac-chip-wrapper {
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
`;

interface Props {
  env: ViewContext;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  exclude?: Set<string>;
  selection: Issue | Issue[];
  onSelectionChange: (selection: Issue | Issue[] | null) => void;
  onAcceptSuggestion?: () => void;
}

export class IssueSelector extends React.Component<Props> {
  private token: string;

  public render() {
    return (
      <IssueAutocomplete
          {...this.props}
          onSearch={this.onSearch}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onRenderSelection={this.onRenderSelection}
          onAcceptSuggestion={this.props.onAcceptSuggestion}
      />
    );
  }

  @bind
  private onSearch(token: string, callback: SearchCallback<Issue>) {
    if (token.length < 1) {
      callback([]);
    } else {
      const { project } = this.props.env;
      this.token = token;
      client.query<IssuesQueryResult>({
        query: IssuesSearchQuery,
        fetchPolicy: 'network-only',
        variables: {
          query: { project: project.id, search: token }
        }
      }).then(({ data, loading, errors }) => {
        let issues = data.issues.issues;
        if (this.props.exclude) {
          issues = issues.filter(i => !this.props.exclude.has(i.id));
        }
        if (!loading && data && !errors && token === this.token) {
          callback(issues.slice(0, 5));
        }
      });
    }
  }

  @bind
  private onRenderSuggestion(issue: Issue) {
    return (
      <IssueSuggestion>
        <span className="id">#{idToIndex(issue.id)}: </span>
        <span className="summary">{issue.summary}</span>
      </IssueSuggestion>
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
