import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Attachment } from '../../../common/types/graphql';
import { AttachmentThumbnail } from './AttachmentThumbnail';

interface Props {
  attachment: Attachment;
  onShow: (attachment: Attachment) => void;
}

/** React component that renders a single attachment (already uploaded). */
export function AttachmentDisplay({ attachment, onShow }: Props) {
  return (
    <AttachmentThumbnail
      attachment={attachment}
      onClick={onShow}
      loaded={true}
    />
  );
}
