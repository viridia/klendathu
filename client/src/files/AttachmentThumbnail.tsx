import * as React from 'react';
import { styled } from '../style';
import { Thumbnail } from './Thumbnail';
import { Attachment } from '../../../common/types/graphql';
import classNames from 'classnames';
import { ProgressBar } from '../controls/widgets';

export const AttachmentThumbnailEl = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin: 4px;
  z-index: 1;
  cursor: pointer;

  & > .name {
    margin-top: 4px;
    font-size: 70%;
  }

  &.error > .name {
    color: red;
  }

  & > .progress {
    margin-top: 4px;
    width: 60px;
    height: 8px;
    opacity: 1;
    transition: opacity .3s ease;
  }

  &.loaded > .progress {
    opacity: 0;
  }
`;

interface Props {
  attachment: Attachment;
  loaded?: boolean;
  error?: boolean;
  progress?: number;
  onClose?: () => void;
  onClick?: () => void;
}

export function AttachmentThumbnail(
    { attachment, loaded, error, onClose, onClick, progress }: Props) {
  const { filename } = attachment;
  return (
    <AttachmentThumbnailEl
      className={classNames('issue-attachment', { loaded, error })}
      title={filename}
    >
      <Thumbnail attachment={attachment} onClick={onClick} onClose={onClose} error={error} />
      <div className="name">{filename}</div>
      {progress !== undefined && <ProgressBar className="progress" value={progress} />}
    </AttachmentThumbnailEl>
  );
}
