import * as React from 'react';
import { AccountName, RelativeDate, MarkdownText } from '../controls';
import { TimelineEntry } from '../../../common/types/graphql';
import { styled } from '../style';

const CommentLayout = styled.section`
  border: 1px solid ${props => props.theme.commentBorderColor};
  border-radius: 4px;
  overflow: hidden;
`;

// Same as TimelineEntryHeader
const CommentHeader = styled.header`
  align-items: center;
  background-color: ${props => props.theme.commentHeaderColor};
  border-bottom: 1px solid ${props => props.theme.cardHeaderDividerColor};
  color: ${props => props.theme.textMuted};
  display: flex;
  font-size: .9rem;
  padding: 4px 6px;
  line-height: 1.4em;
  justify-content: flex-start;

  .account-name {
    font-weight: bold;
    color: ${props => props.theme.textNormal};
  }
`;

const CommentBody = styled(MarkdownText)`
  background-color: ${props => props.theme.commentBgColor};
  color: ${props => props.theme.textNormal};
  font-size: 90%;
  line-height: 1.3em;
  margin: 0;
  padding: 4px 6px;

  > p {
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  code {
    white-space: pre;
  }
`;

export function CommentDisplay({ comment }: { comment: TimelineEntry }) {
  return (
    <CommentLayout>
      <CommentHeader>
        <AccountName id={comment.by} />
        &nbsp;commented&nbsp;
        <RelativeDate date={comment.at} withPrefix={true} />
        :
      </CommentHeader>
      <CommentBody className="comment-body" content={comment.commentBody} />
    </CommentLayout>
  );
}
