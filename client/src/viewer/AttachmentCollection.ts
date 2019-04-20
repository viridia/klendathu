import { MediaCollection, MediaObject } from './MediaCollection';
import { Attachment } from '../../../common/types/graphql';

export class AttachmentCollection implements MediaCollection {
  constructor(private attachments: Attachment[]) {}

  get size() { return this.attachments.length; }

  public get(id: string): MediaObject {
    const a = this.attachments.find(att => att.url === id);
    if (a) {
      return {
        id: a.url,
        name: a.filename,
        url: a.url,
        type: a.type,
      };
    }
    return null;
  }

  next(id: string): string {
    if (this.attachments.length <= 0) {
      return null;
    }
    const index = this.attachments.findIndex(a => a.url === id) + 1;
    return index >= this.attachments.length ? this.attachments[0].url : this.attachments[index].url;
  }

  prev(id: string): string {
    if (this.attachments.length <= 0) {
      return null;
    }
    const index = this.attachments.findIndex(a => a.url === id);
    return index > 0
      ? this.attachments[index - 1].url
      : this.attachments[this.attachments.length - 1].url;
  }
}
