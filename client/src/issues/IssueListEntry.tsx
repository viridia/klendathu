import * as React from 'react';
import { Account, Issue, Role } from 'klendathu-json-types';
import {
  ObservableProjectPrefs,
  ObservableSet,
  Project
} from '../../models';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { LabelName } from '../common/LabelName';
import { ColumnRenderer } from './columns';
import { Checkbox } from 'react-bootstrap';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';

interface Props extends RouteComponentProps<{}> {
  account: Account;
  project: Project;
  prefs: ObservableProjectPrefs;
  issue: Issue;
  columnRenderers: Map<string, ColumnRenderer>;
  selection: ObservableSet;
}

@observer
export class IssueListEntry extends React.Component<Props> {
  public render() {
    const { account, issue, project, prefs, columnRenderers, selection } = this.props;
    const index = issue.id.split('/', 4)[2];
    const linkTarget = {
      pathname: `/${account.uname}/${project.uname}/${index}`,
      state: { back: this.props.location },
    };
    const issueId = `issue-${issue.id}`;
    const style: any = {};
    const level = 0;
    if (level > 0) {
      style.marginLeft = `${level * 32}px`;
    }
    return (
      <tr>
        {project.role >= Role.UPDATER && (<td className="selected">
          <label htmlFor={issueId}>
            <Checkbox
                id={issueId}
                bsClass="cbox"
                data-id={issue.id}
                checked={selection.has(issue.id)}
                onChange={this.onChangeSelection}
            />
          </label>
        </td>)}
        <td className="id">
          <NavLink to={linkTarget}>{index}</NavLink>
        </td>
        {prefs.columns.map(cname => {
          const cr = columnRenderers.get(cname);
          if (cr) {
            return cr.render(issue);
          }
          return <td className="custom" key={cname} />;
        })}
        <td className="title">
          <NavLink to={linkTarget} className={classNames({ child: level > 0 })} style={style}>
            <span className="summary">{issue.summary}</span>
            {issue.labels
              .filter(l => prefs.showLabel(l))
              .map(l => <LabelName label={l} key={l} />)}
          </NavLink>
        </td>
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
