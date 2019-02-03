import { ObjectID } from 'mongodb';

export interface AttachmentRecord {
  _id?: ObjectID;
  attachmentId: string;
  issue?: string;
  comment?: string;
}
