import * as React from 'react';
import { Account } from 'klendathu-json-types';
import { issues, Project } from '../../models';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';

interface Props {
  account?: Account;
  project?: Project;
  id: string;
}

/** Component that displays an issue as a single-line summary. */
@observer
export class IssueSummary extends React.Component<Props> {
  public render() {
    const { id, account, project } = this.props;
    const issue = issues.get(id);
    if (issue) {
      if (account && project) {
        return (
          <NavLink to={`/${account.uname}/${project.uname}/${issue.index}`}>
            <span className="issue">
              <span className="id">#{issue.index}</span>
              <span className="summary">: {issue.summary}</span>
            </span>
          </NavLink>
        );
      }
      return (
        <span className="issue">
          <span className="id">#{issue.index}</span>
          <span className="summary">: {issue.summary}</span>
        </span>
      );
    } else {
      return (
        <span className="issue">
          <span className="id">#{id}</span>
          <span className="summary unknown">: unknown issue</span>
        </span>
      );
    }
  }
}
