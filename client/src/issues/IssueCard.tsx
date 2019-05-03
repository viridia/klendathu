import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import { Issue } from '../../../common/types/graphql';
import { Avatar, AccountName } from '../controls';
import { styled } from '../style';
import { idToIndex } from '../lib/idToIndex';
import { IssueTypeTag, ResponsiveIssueSummary } from './details';

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
`;

const IssueCardBody = styled(ResponsiveIssueSummary)`
  margin-top: 2px;
  font-weight: bold;
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
  issue: Issue;
  group?: string;
}

@observer
export class IssueCard extends React.Component<Props> {
  public render() {
    const { issue } = this.props;
    const index = idToIndex(issue.id);
    return (
      <IssueCardDiv draggable={true} onDragStart={this.onDragStart}>
        <IssueCardHeader>
          #<span className="index">{index}</span>
          <IssueTypeTag issue={issue} />
        </IssueCardHeader>
        <IssueCardBody issue={issue} />
        <IssueCardFooter>
          <Avatar id={issue.owner} small={true} />
          <AccountName id={issue.owner} />
        </IssueCardFooter>
      </IssueCardDiv>
    );
  }

  @bind
  private onDragStart(e: any) {
    const { issue, group } = this.props;
    e.dataTransfer.setData(`issue/${issue.id}/${group}`, '');
    e.dataTransfer.dropEffect = 'move';
  }
}
