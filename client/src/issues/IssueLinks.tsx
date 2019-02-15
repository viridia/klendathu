import * as React from 'react';
import bind from 'bind-decorator';
import { Account, Relation } from 'klendathu-json-types';
import { IssueListQuery, Project } from '../../models';
import { IssueSummary } from './IssueSummary';
import { relationNames } from '../common/relationNames';
import { observer } from 'mobx-react';

import CloseIcon from '../../../icons/ic_close.svg';

interface Props {
  account?: Account;
  project: Project;
  issues: IssueListQuery;
  links: Map<string, Relation>;
  onRemoveLink?: (to: string) => void;
}

@observer
export class IssueLinks extends React.Component<Props> {
  public render() {
    const { links } = this.props;
    if (!links || links.size === 0) {
      return null;
    }
    return <ul className="issue-links">{Array.from(links.entries()).map(this.renderLink)}</ul>;
  }

  @bind
  private renderLink([to, relation]: [string, Relation]) {
    const { project, account, onRemoveLink } = this.props;
    return (
      <li className="issue-link" key={to}>
        <span className="relation">{relationNames[relation]}</span>
        <IssueSummary id={to} account={account} project={project} />
        {onRemoveLink && (
          <Button className="bare light" onClick={() => onRemoveLink(to)}>
            <CloseIcon />
          </Button>)}
      </li>
    );
  }
}
