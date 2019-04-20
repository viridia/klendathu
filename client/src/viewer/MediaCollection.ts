export interface MediaObject {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface MediaCollection {
  size: number;
  get(id: string): MediaObject;
  next(id: string): string;
  prev(id: string): string;
}
