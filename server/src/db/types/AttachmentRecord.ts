import { ObjectID } from 'bson';

export interface AttachmentRecord {
  _id?: ObjectID;
  attachmentId: string;
  issue?: string;
  comment?: string;
}
