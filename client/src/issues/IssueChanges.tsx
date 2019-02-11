import {
  Account,
  Change,
  Comment,
} from 'klendathu-json-types';
import * as marked from 'marked';
import * as React from 'react';
import { RelativeDate } from '../common/RelativeDate';
import { AccountName } from '../common/AccountName';
import { ObservableIssue, Project } from '../../models';
import { ChangeEntry } from '../history/ChangeEntry';

function compareEntries(a: [Date, JSX.Element], b: [Date, JSX.Element]) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return 1; }
  return 0;
}

function renderBody(body: string) {
  return <div className="comment-body" dangerouslySetInnerHTML={{ __html: marked(body) }} />;
}

function Comment({ comment }: { comment: Comment }) {
  return (
    <section className="comment">
      <header className="comment-header">
        <AccountName id={comment.author} full={true} />
        &nbsp;commented&nbsp;
        <RelativeDate date={comment.created} withPrefix={true} />
        :
      </header>
      {renderBody(comment.body)}
    </section>
  );
}

interface Props {
  issue: ObservableIssue;
  comments: Comment[];
  changes: Change[];
  account: Account;
  project: Project;
}

export class IssueChanges extends React.Component<Props> {
  public render() {
    return (
      <section className="changes-list">
        {this.sortEntriesByDate().map(entry => entry[1])}
      </section>
    );
  }

  private sortEntriesByDate() {
    const { comments, changes, project, account } = this.props;
    const result: Array<[Date, JSX.Element]> = [];
    if (comments) {
      comments.forEach(c => {
        result.push([c.created, <Comment comment={c} key={c.id} />]);
      });
    }
    if (changes) {
      changes.forEach(c => {
        result.push([c.at,
          <ChangeEntry change={c} key={c.id} project={project} account={account} />]);
      });
    }
    // TODO: Make this computed
    result.sort(compareEntries);
    return result;
  }
}
