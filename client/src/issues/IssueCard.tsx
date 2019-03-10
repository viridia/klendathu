import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import bind from 'bind-decorator';
import { Issue } from '../../../common/types/graphql';
import { LabelName, Avatar, AccountName } from '../controls';
import { ViewContext } from '../models';
import { styled } from '../style';
import { idToIndex } from '../lib/idToIndex';

const IssueCardDiv = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme.cardInnerBorderColor};
  border-radius: 5px;
  background-color: ${props => props.theme.cardInnerBgColor};
  box-shadow: 0px 2px 3px 0 ${props => props.theme.cardShadowColor};
  cursor: move;
  margin-bottom: .5rem;
  overflow: hidden;
  padding: 4px;
  width: 12rem;
  min-height: 6rem;
  text-align: left;
  user-select: none;

  &:last-child {
    margin-bottom: 0;
  }
`;

const IssueCardHeader = styled.header`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.cardHeaderDividerColor};
  display: flex;
  flex-direction: row;
  padding-bottom: 4px;

  .index {
    font-weight: bold;
    margin-right: 4px;
  }

  .type {
    padding: 2px 4px;
    font-size: .8rem;
    font-weight: bold;
    border-radius: 3px;
  }
`;

const IssueCardBody = styled.div`
  margin-top: 2px;
  flex: 1;
  font-size: 1rem;
  font-weight: bold;

  &.large {
    line-height: 1rem;
    > .summary {
      font-size: 1rem;
    }
  }
  &.medium {
    line-height: .9rem;
    > .summary {
      font-size: .9rem;
    }
  }
  &.small {
    line-height: .7rem;
    > .summary {
      font-size: .7rem;
    }
  }

  .summary {
    margin-right: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .label-name {
    margin-right: auto;
    margin-left: 0;
    margin-bottom: 3px;
  }
`;

const IssueCardFooter = styled.footer`
  display: flex;
  align-items: center;
  margin-top: 4px;
  .avatar {
    margin-right: 4px;
  }
  .unassigned {
    font-style: italic;
    color: ${props => props.theme.textMuted};
  }
`;

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
  issue: Issue;
  group?: string;
}

@observer
export class IssueCard extends React.Component<Props> {
  public render() {
    const { issue, env } = this.props;
    const index = idToIndex(issue.id);
    return (
      <IssueCardDiv draggable={true} onDragStart={this.onDragStart}>
        <IssueCardHeader>
          #<span className="index">{index}</span>
          {this.renderIssueType()}
        </IssueCardHeader>
        <IssueCardBody className={this.summarySize}>
          <span className="summary">
            {issue.summary}
          </span>
          {issue.labels
            .filter(l => env.visibleLabels.has(l))
            .map(l => <LabelName id={l} key={l} size="smaller" />)}
        </IssueCardBody>
        <IssueCardFooter>
          <Avatar id={issue.owner} small={true} />
          <AccountName id={issue.owner} />
        </IssueCardFooter>
      </IssueCardDiv>
    );
  }

  private get summarySize(): string {
    const { issue } = this.props;
    if (issue.summary.length < 32) {
      return 'large';
    }
    if (issue.summary.length < 100) {
      return 'medium';
    }
    return 'small';
  }

  private renderIssueType() {
    const { issue, env } = this.props;
    const typeInfo = env.getInheritedIssueType(issue.type);
    if (!typeInfo) {
      return <div className="type">{issue.type}</div>;
    }
    return (
      <div className="type" style={{ backgroundColor: typeInfo.bg }}>{typeInfo.caption}</div>
    );
  }

  @bind
  private onDragStart(e: any) {
    const { issue, group } = this.props;
    e.dataTransfer.setData(`issue/${issue.id}/${group}`, '');
    e.dataTransfer.dropEffect = 'move';
  }
}
