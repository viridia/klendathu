import * as React from 'react';
import { Attachment } from '../../../common/types/graphql';
import { AttachmentDisplay } from './AttachmentDisplay';
import { AttachmentCollection, MediaViewerDialog, MediaViewerModel } from '../viewer';
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
  attachments: Attachment[];
}

/** React component that represents a list of attachments to an issue. */
export function ShowAttachments({ attachments }: Props) {
  console.log(attachments);
  const model = React.useMemo(
    () => new MediaViewerModel(new AttachmentCollection(attachments)), attachments);

  return (
    <ShowAttachmentsEl>
      <MediaViewerDialog model={model} />
      {attachments.map((a, index) => (
        <AttachmentDisplay key={a.id} attachment={a} onShow={() => model.show(a.url)} />))}
    </ShowAttachmentsEl>
  );
}
