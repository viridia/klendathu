import * as marked from 'marked';
import * as React from 'react';
import { AccountName, RelativeDate } from '../controls';
import { IssueChangeEntry } from '../../../common/types/graphql';

function renderBody(body: string) {
  return <div className="comment-body" dangerouslySetInnerHTML={{ __html: marked(body) }} />;
}

export function Comment({ comment }: { comment: IssueChangeEntry }) {
  return (
    <section className="comment">
      <header className="comment-header">
        <AccountName id={comment.by} />
        &nbsp;commented&nbsp;
        <RelativeDate date={comment.at} withPrefix={true} />
        :
      </header>
      {renderBody(comment.commentBody)}
    </section>
  );
}
