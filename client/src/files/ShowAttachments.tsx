import * as React from 'react';
import { AttachmentDisplay } from './AttachmentDisplay';
import { styled } from '../style';

const ShowAttachmentsEl = styled.div`
  display: flex;
  align-items: flex-end;
  flex: 1;
  flex-direction: row;
  grid-column: controls;
  justify-self: stretch;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-weight: normal;
  font-size: 80%;
  padding: 1px;
`;

interface Props {
  fileList: Attachment[];
  onShow: (attachment: Attachment) => void;
}

/** React component that represents a list of attachments to an issue. */
export function ShowAttachments({ attachments, onShow }: Props) {
  const [selected, showSelected] = React.useState<Attachment>();

  return (
    <ShowAttachmentsEl>
      {attachments.map(a => (
        <AttachmentDisplay key={a.id} attachment={a} onShow={showSelected} />))}
    </ShowAttachmentsEl>
  );
}
