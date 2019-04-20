import { MediaCollection, MediaObject } from './MediaCollection';
import { observable, computed, action } from 'mobx';

export class MediaViewerModel {
  @observable public open = false;
  @observable private selectedId: string = null;

  constructor(private collection: MediaCollection) {}

  @action.bound
  public show(id: string) {
    this.selectedId = id;
    this.open = true;
  }

  @computed
  public get current(): MediaObject {
    return this.collection.get(this.selectedId);
  }

  @action.bound
  public next() {
    this.selectedId = this.collection.next(this.selectedId);
  }

  @action.bound
  public prev() {
    this.selectedId = this.collection.prev(this.selectedId);
  }
}
