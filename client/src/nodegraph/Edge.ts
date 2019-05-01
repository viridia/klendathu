import { Node } from './Node';
import { Vec2 } from './Vec2';

export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

export const DIR_DX = [0, 1, 0, -1];
export const DIR_DY = [-1, 0, 1, 0];

export enum EdgeStyle {
  PARENT = 'parent',
  PRED = 'pred',
  RELATED = 'related',
}

export interface Edge {
  id: string;
  source: Node;
  target: Node;
  style: EdgeStyle;
  initialDir: Direction;
  vertices: Vec2[];
  verticesTransformed: Vec2[];
}
