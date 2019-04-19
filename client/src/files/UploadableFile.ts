import { action, observable } from 'mobx';
import { Attachment, Project } from '../../../common/types/graphql';
import { request } from '../models/Session';

/** Data object representing a file to upload. This mainly exists so that we can keep the
    browser File object and it's associated progress callback together in once place. */
export class UploadableFile implements Attachment {
  public id: string;
  public url: string;
  public thumbnail?: string;
  @observable public progressPercent: number;
  private file: File;
  private project: Project;

  constructor(project: Project, file: File) {
    this.project = project;
    this.file = file;
    this.progressPercent = 0;
    this.id = null;
    this.url = null;
  }

  public get filename() {
    return this.file.name;
  }

  public get type() {
    return this.file.type;
  }

  /** Begin uploading the file, returns a promise. */
  public upload() {
    const formData = new FormData();
    formData.append('attachment', this.file);
    return request.post(`/file/upload/${this.project.id}`, formData, {
      onUploadProgress: this.onProgress,
    }).then(resp => {
      this.id = resp.data.id;
      this.url = resp.data.url;
      this.thumbnail = resp.data.thumb;
      return resp.data;
    });
  }

  @action.bound
  private onProgress(e: any) {
    this.progressPercent = e.value * 100 / e.total;
  }
}
