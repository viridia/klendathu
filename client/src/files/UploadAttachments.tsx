import * as React from 'react';
import { FileDropZone } from './FileDropZone';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../models';
import { Attachment } from '../../../common/types/graphql';
import { AttachmentPreview } from './AttachmentPreview';
import { styled } from '../style';

const UploadAttachmentsEl = styled.div`
  position: relative;
  flex: 1;
`;

const FilesEl = styled.div`
  padding: 4px;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  flex-wrap: wrap;
  min-height: 3rem;
`;

interface Props {
  env: ViewContext;
  attachments: Attachment[];
}

/** React component that represents a list of attachments to be uploaded. */
@observer
export class UploadAttachments extends React.Component<Props> {

  public render() {
    const { attachments, env } = this.props;
    return (
      <UploadAttachmentsEl className="upload-attachments">
        <FilesEl className="files">
          {this.renderFiles()}
        </FilesEl>
        <FileDropZone
          env={env}
          fileList={attachments} /*onChangeFiles={this.onChangeFiles}*/
        />
      </UploadAttachmentsEl>
    );
  }

  private renderFiles() {
    const { attachments } = this.props;
    return attachments.map(attachment => (
      <AttachmentPreview
        key={attachment.filename}
        attachment={attachment}
        onRemove={this.onRemove}
        onShow={this.showAttachment}
      />));
  }

  @action.bound
  private showAttachment(attachment: Attachment) {
    // pass
  }

  @action.bound
  private onRemove(attachment: Attachment) {
    const { attachments } = this.props;
    const index = attachments.indexOf(attachment);
    if (index >= 0) {
      attachments.splice(index, 1);
    }
  }
}
