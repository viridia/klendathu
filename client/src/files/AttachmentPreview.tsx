import * as React from 'react';
import { toast } from 'react-toastify';
import { UploadableFile } from './UploadableFile';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Attachment } from '../../../common/types/graphql';
import bind from 'bind-decorator';
import { AttachmentThumbnail } from './AttachmentThumbnail';

interface Props {
  attachment: Attachment;
  onRemove: (attachment: Attachment) => void;
  onShow: (attachment: Attachment) => void;
}

/** React component that renders a single attachment to be uploaded. */
@observer
export class AttachmentPreview extends React.Component<Props> {
  @observable private error = false;
  @observable private loaded = false;

  constructor(props: Props, context: any) {
    super(props, context);
    this.loaded = !!props.attachment.url;
  }

  public componentDidMount() {
    if (!this.props.attachment.url) {
      (this.props.attachment as UploadableFile).upload().then(data => {
        if (data) {
          this.loaded = true;
        }
      }, error => {
        this.error = true;
        toast.error('Upload failed');
        console.error('post file error:', error);
      });
    }
  }

  public render() {
    const { attachment } = this.props;
    let progress = 0;
    if (!this.props.attachment.url) {
      progress = (this.props.attachment as UploadableFile).progressPercent;
    }

    return (
      <AttachmentThumbnail
        loaded={this.loaded}
        error={this.error}
        attachment={attachment}
        progress={progress}
        onClose={this.onRemove}
        onClick={this.onShow}
      />
    );
  }

  @bind
  private onRemove() {
    this.props.onRemove(this.props.attachment);
  }

  @bind
  private onShow() {
    this.props.onShow(this.props.attachment);
  }
}
