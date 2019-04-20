import * as React from 'react';
import { Attachment } from '../../../common/types/graphql';
import { styled } from '../style';
import { session } from '../models';
import CloseIcon from '../svg-compiled/icons/IcClose';
import ErrorIcon from '../svg-compiled/icons/IcError';
import classNames from 'classnames';

/** Preview content for thumbnail. */
export function ThumbnailPreviewContent({ attachment }: { attachment: Attachment }) {
  const { filename, url, thumbnail, type } = attachment;
  if (!url) {
    return <div className="image nothumb" />;
  }
  switch (type) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
      if (thumbnail) {
        return (<img
          className="image thumb"
          src={session.withAuthParam(thumbnail)}
          alt={filename}
        />);
      } else if (url) {
        return (<img
          className="image"
          src={session.withAuthParam(url)}
          alt={session.withAuthParam(filename)}
        />);
      }
      return <div className="image nothumb" />;
    case 'image/svg+xml':
      // TODO: This doesn't work.
      // if (url) {
      //   return <img className="image svg" src={url} alt={filename} />;
      // }
      return <div className="image nothumb" />;
    case 'text/plain':
    case 'application/rtf':
    case 'application/msword':
      return <div className="doc" />;
    case 'application/x-gzip':
    case 'application/java-archive':
    case 'application/x-tar':
    case 'application/zip':
    case 'application/x-compressed-zip':
      return <div className="archive" />;
    default:
      return <div className="generic" />;
  }
}

const ThumbnailFrame = styled.div`
  position: relative;

  &.error {
    border: 1px solid #c00;
    background-color: #faa;
  }

  > * {
    border: 1px solid #889;
    background-color: #dde;
    box-shadow: 0 2px 4px 2px rgba(0,0,0,0.24);
  }

  /* > .doc, > .archive, > .generic, > .nothumb {
    width: 50px;
    height: 70px;
  } */

  > .svg, > .image {
    min-width: 30px;
    min-height: 30px;
  }

  & > .close {
    display: flex;
    cursor: pointer;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 24px;
    height: 24px;
    top: 2px;
    right: 2px;
    background: #fff8;
    border-radius: 4px;
    border: none;
    opacity: 0;
    padding: 0;

    > svg {
      height: 16px;
      width: 16px;
    }
  }

  & > .error-icon {
    position: absolute;
    top: 2px;
    left: 2px;
    path {
      fill: #d44;
    }
  }

  &:hover > .close {
    opacity: .7;
  }
`;

interface Props {
  attachment: Attachment;
  error?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

/** Thumbnail preview plus optional close button. */
export function Thumbnail({ attachment, onClose, onClick, error }: Props) {
  return (
    <ThumbnailFrame className={classNames('attach-thumb', { error })} onClick={onClick}>
      {onClose && <button className="close" onClick={onClose}><CloseIcon /></button>}
      {error && <ErrorIcon className="error-icon" />}
      <ThumbnailPreviewContent attachment={attachment} />
    </ThumbnailFrame>
  );
}
