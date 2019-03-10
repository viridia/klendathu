import * as React from 'react';
import { GroupHeader } from '../issues/GroupHeader';
import { IssueCard } from '../issues/IssueCard';
import { RouteComponentProps } from 'react-router-dom';
import { action, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../models';
import classNames from 'classnames';
import { Issue } from '../../../common/types/graphql';
import { IssueGroup } from '../models/IssueQueryModel';
import { styled } from '../style';

const ProgressGridSection = styled.section`
  overflow: auto;
  position: relative;
  margin: 0 8px;
  padding: 0 0 4px 0;
`;

const ProgressGridTable = styled.table`
  border-collapse: collapse;
`;

const StateHeader = styled.thead`
  background-color: ${props => props.theme.cardHeaderBgColor};
  border: 1px solid ${props => props.theme.cardBorderColor};
  th {
    border-right: 2px dashed ${props => props.theme.cardHeaderDividerColor};
    text-align: center;
    vertical-align: bottom;
    padding: 4px 8px;
    &.dragOver {
      background-color: ${props => props.theme.cardShadowColor};
    }

    &:last-child {
      border-right: 1px solid ${props => props.theme.cardBorderColor};
    }
  }
`;

const ProgressGridTableBody = styled.tbody`
  border: 1px solid ${props => props.theme.cardBorderColor};
  box-shadow: 0px 2px 2px 0 ${props => props.theme.cardShadowColor};

  tr {
    background-color: ${props => props.theme.cardBgColor};
    box-shadow: inset 0px 3px 2px 0 ${props => props.theme.cardShadowColor};
  }

  td {
    border-right: 2px dashed ${props => props.theme.cardHeaderDividerColor};
    text-align: center;

    vertical-align: top;
    padding: 7px 6px 6px 6px;

    &:last-child {
      border-right: 1px solid ${props => props.theme.cardBorderColor};
    }

    &.dragOver {
      background-color: ${props => props.theme.cardBgColorAltRow};
    }
  }
`;

const ProgressColumnLabel = styled.div`
  color: ${props => props.theme.textMuted};
  writing-mode: vertical-lr;
  white-space: nowrap;
  margin: auto;
`;

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
}

@observer
export class ProgressGrid extends React.Component<Props> {
  @observable private dragState: string = null;
  @observable private dragGroup: string = undefined;

  public render() {
    return (
      <ProgressGridSection>
        <ProgressGridTable className="progress-table">
          {this.renderGroups()}
        </ProgressGridTable>
      </ProgressGridSection>
    );
  }

  public renderGroups() {
    const { env } = this.props;
    const { issues } = env;
    if (issues.group) {
      return issues.grouped.map(gr => {
        return this.renderIssues(gr.issues, gr);
      });
    } else {
      return this.renderIssues(issues.list, null);
    }
  }

  public renderIssues(
      issues: Issue[],
      group?: IssueGroup) {
    const { template } = this.props.env;
    const issuesByState = this.groupByState;
    const result: JSX.Element[] = [];
    const groupId = group && group.value || '';
    if (group) {
      result.push(
        <thead className="group-header" key={`${group.sortKey}-group-header`}>
          <tr>
            <GroupHeader group={group} />
          </tr>
        </thead>
      );
    }
    result.push(
      <StateHeader key={`${group ? group.sortKey : 'progress'}-state-header`}>
        <tr>
          {template.states.map(st => (
            <th
                className={classNames({
                  collapsed: !issuesByState.has(st.id),
                  dragOver: st.id === this.dragState && groupId === this.dragGroup,
                })}
                key={st.id}
            >
              {issuesByState.has(st.id) && st.caption}
            </th>
          ))}
        </tr>
      </StateHeader>
    );
    result.push(
      <ProgressGridTableBody key={`${group ? group.sortKey : 'progress'}-body`}>
        <tr>
          {template.states.map(st => {
            const ilist = issues.filter(iss => iss.state === st.id);
            const nonEmptyList = issuesByState.has(st.id);
            return (
              <td
                  className={classNames({
                    collapsed: !nonEmptyList,
                    dragOver: st.id === this.dragState && groupId === this.dragGroup,
                  })}
                  data-state={st.id}
                  data-group={groupId}
                  key={st.id}
                  onDragOver={this.onDragOver}
                  onDragLeave={this.onDragLeave}
                  onDrop={this.onDrop}
              >
                {!nonEmptyList
                  ? <ProgressColumnLabel>{st.caption}</ProgressColumnLabel>
                  : ilist && ilist.map(i =>
                      <IssueCard {...this.props} key={i.id} issue={i} group={groupId} />)}
              </td>
            );
          })}
        </tr>
      </ProgressGridTableBody>
    );
    return result;
  }

  @action.bound
  private onDragOver(e: React.DragEvent<any>) {
    e.preventDefault();
    this.dragState = null;
    this.dragGroup = null;
    for (const type of e.dataTransfer.types) {
      if (type.startsWith('issue/')) {
        const [, issueId, fromGroup] = type.split('/', 3);
        const issue = this.byId.get(issueId);
        if (issue) {
          const state = e.currentTarget.dataset.state;
          const group = e.currentTarget.dataset.group;
          if (state !== issue.state && fromGroup === group) {
            this.dragState = state;
            this.dragGroup = group;
          }
        }
        break;
      }
    }
  }

  @action.bound
  private onDragLeave(e: React.DragEvent<any>) {
    e.preventDefault();
    this.dragState = null;
    this.dragGroup = null;
  }

  @action.bound
  private onDrop(e: React.DragEvent<any>) {
    e.preventDefault();
    if (this.dragState) {
      for (const type of e.dataTransfer.types) {
        if (type.startsWith('issue/')) {
          const [, issueId] = type.split('/', 2);
          const issue = this.byId.get(issueId);
          console.log(issue);
          // updateIssue(issue.id, { state: this.dragState });
          break;
        }
      }
    }
    this.dragState = null;
    this.dragGroup = null;
  }

  @computed
  private get byId(): Map<string, Issue> {
    const { issues } = this.props.env;
    return new Map<string, Issue>(issues.list.map(iss => [iss.id, iss] as [string, Issue]));
  }

  @computed
  private get groupByState(): Map<string, Issue[]> {
    const { issues } = this.props.env;
    const issuesByState = new Map<string, Issue[]>();
    for (const issue of issues.list) {
      const issueList = issuesByState.get(issue.state);
      if (issueList) {
        issueList.push(issue);
      } else {
        issuesByState.set(issue.state, [issue]);
      }
    }
    return issuesByState;
  }
}
