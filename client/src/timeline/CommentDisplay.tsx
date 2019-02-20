import * as React from 'react';
import { AccountName, RelativeDate, MarkdownText } from '../controls';
import { TimelineEntry } from '../../../common/types/graphql';
import { styled } from '../style';

const CommentLayout = styled.section`
  border: 1px solid lighten($cardBorder, 15%);
  border-radius: 4px;
  margin-bottom: 8px;
`;

// Same as TimelineEntryHeader
const CommentHeader = styled.header`
  font-size: .9rem;
  padding: 0 8px 4px 0;
  line-height: 1.4em;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.cardHeaderDividerColor};
  color: ${props => props.theme.textMuted};

  .account-name {
    font-weight: bold;
    color: ${props => props.theme.textNormal};
  }
`;

const CommentBody = styled(MarkdownText)`
  margin: 0;
  padding: 4px 0;
  font-size: 90%;
  color: $textDark;
  line-height: 1.3em;

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
