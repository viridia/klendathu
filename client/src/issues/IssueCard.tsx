import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import bind from 'bind-decorator';
import { Issue } from '../../../common/types/graphql';
import { LabelName, Avatar, AccountName } from '../controls';
import { ViewContext } from '../models';

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
  issue: Issue;
  group?: string;
}

@observer
export class IssueCard extends React.Component<Props> {
  public render() {
    const { issue, env } = this.props;
    const index = issue.id.split('/', 4)[2];
    return (
      <div className="issue-card" draggable={true} onDragStart={this.onDragStart}>
        <header>
          #<span className="index">{index}</span>
          {this.renderIssueType()}
        </header>
        <div className="body">
          <span className={classNames('summary', this.summarySize)}>
            {issue.summary}
          </span>
          {issue.labels
            .filter(l => env.visibleLabels.has(l))
            .map(l => <LabelName id={l} key={l} />)}
      </div>
        <footer>
          <Avatar id={issue.owner} />
          <AccountName id={issue.owner} />
        </footer>
      </div>
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
