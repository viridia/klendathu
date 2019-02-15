import bind from 'bind-decorator';
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { TextArea, Button } from '../../controls';
import styled from 'styled-components';

interface Props {
  disabled?: boolean;
  onAddComment: (body: string) => void;
}

const CommentEditLayout = styled.section`
  align-items: flex-start;
  justify-self: stretch;
  display: flex;
  flex-direction: column;

  > .comment-container {
    align-self: stretch;
    margin-bottom: .2rem;
    > textarea {
      height: 8rem;
    }
  }
`;

@observer
export class CommentEdit extends React.Component<Props> {
  @observable private newComment = '';

  public render() {
    const { disabled } = this.props;
    return (
      <CommentEditLayout>
        <TextArea
            containerClassName="comment-container"
            className="comment-entry"
            disabled={disabled}
            value={this.newComment}
            placeholder="Leave a comment... (markdown format supported)"
            onChange={this.onChangeCommentBody}
        />
        <Button
            title="add comment"
            disabled={disabled || this.newComment.length === 0}
            onClick={this.onAddComment}
        >
          Comment
        </Button>
      </CommentEditLayout>
    );
  }

  @bind
  private onChangeCommentBody(e: any) {
    this.newComment = e.target.value;
  }

  @bind
  private onAddComment() {
    this.props.onAddComment(this.newComment);
    this.newComment = '';
  }
}
