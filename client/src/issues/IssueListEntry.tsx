import * as React from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { ColumnRenderer } from './columns';
import { action, ObservableSet } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../models';
import { Issue } from '../../../common/types/graphql';
import { Role } from '../../../common/types/json';
import { CheckBox, LabelName } from '../controls';
import { styled } from '../style';
import classNames from 'classnames';
import { idToIndex } from '../lib/idToIndex';

const SelectedCell = styled.td`
  width: 2rem;
`;

const IdCell = styled.td`
  text-align: center;
  width: 2rem;
  > a {
    display: block;
    text-decoration: none;
    color: ${props => props.theme.textDark};
  }
`;

const TitleCell = styled.td`
  padding: 0 4px;
  > a {
    color: ${props => props.theme.textDark};
    line-height: 1.8rem; /* Needed to make chips line up with summary. */
    text-decoration: none;
  }
  .summary {
    padding-top: 4px;
    font-weight: bold;
    margin-right: .4rem;
  }
  .chip {
    position: relative;
    top: -2px;
  }
`;

interface Props extends RouteComponentProps<{}> {
  context: ViewContext;
  issue: Issue;
  columnRenderers: Map<string, ColumnRenderer>;
  selection: ObservableSet;
}

@observer
export class IssueListEntry extends React.Component<Props> {
  public render() {
    const { context, issue, columnRenderers, selection } = this.props;
    const { account, project, prefs } = context;
    const index = idToIndex(issue.id);
    const linkTarget = {
      pathname: `/${account.accountName}/${project.name}/${index}`,
      state: { back: this.props.location },
    };
    const issueId = `issue-${issue.id}`;
    const style: any = {};
    const level = 0;
    if (level > 0) {
      style.marginLeft = `${level * 32}px`;
    }
    return (
      <tr className={classNames({ added: context.issues.recentlyAdded.has(issue.id) })}>
        {project.role >= Role.UPDATER && (
          <SelectedCell className="selected">
            <CheckBox
                id={issueId}
                data-id={issue.id}
                checked={selection.has(issue.id)}
                onChange={this.onChangeSelection}
            />
          </SelectedCell>)}
        <IdCell>
          <NavLink to={linkTarget}>{index}</NavLink>
        </IdCell>
        {prefs.columns.map(cname => {
          const cr = columnRenderers.get(cname);
          if (cr) {
            return cr.render(issue);
          }
          return <td className="custom" key={cname} />;
        })}
        <TitleCell>
          <NavLink to={linkTarget} className={classNames({ child: level > 0 })} style={style}>
            <span className="summary">{issue.summary}</span>
            {issue.labels
              .filter(l => context.visibleLabels.has(l))
              .map(l => <LabelName small={true} id={l} key={l} />)}
          </NavLink>
        </TitleCell>
      </tr>
    );
  }

  @action.bound
  private onChangeSelection(e: any) {
    const { issue, selection } = this.props;
    if (e.target.checked) {
      selection.add(issue.id);
    } else {
      selection.delete(issue.id);
    }
  }
}
