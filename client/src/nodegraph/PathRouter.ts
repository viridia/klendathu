import { Node } from './Node';
import { Edge, Direction, DIR_DX, DIR_DY } from './Edge';
import * as Vec2 from './Vec2';
import FastPriorityQueue from 'fastpriorityqueue';

enum Crossing {
  NEITHER = 0,
  HORIZONTAL = 1,
  VERTICAL = 2,
  BOTH = 3,
}

// [crossing bits, edge, node]
type PathCell = [Crossing, Edge, Node];

// [cost, direction]
type RouteCell = [number, Direction];

// [cost, direction, x, y]
type RouteQueueItem = [number, Direction, number, number];

// const CROSSING_COST = 3;

// Lines that pass through the center of a 3x3 cell are less costly.
function lineCost(x: number): number {
  return (x % 3) === 1 ? 0 : 3;
}

function turnCost(oldDir: Direction, newDir: Direction) {
  const delta = Math.abs(oldDir - newDir); // 0..3
  return delta === 3 ? 1 : delta;
}

const crossingDir = (d: Direction) =>
    (d === Direction.UP || d === Direction.DOWN) ? Crossing.VERTICAL : Crossing.HORIZONTAL;

export class PathRouter {
  private width: number;
  private height: number;
  private pathArray: PathCell[] = [];
  private routeArray: RouteCell[] = [];
  private queue: FastPriorityQueue<RouteQueueItem>;
  private edge: Edge;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pathArray.length = width * height;
    this.routeArray.length = width * height;
  }

  public addNode(node: Node, x: number, y: number, nodeWidth: number, nodeHeight: number) {
    const width = this.width;
    for (let xi = x; xi < x + nodeWidth; xi = xi + 1) {
      for (let yi = y; yi < y + nodeHeight; yi = yi + 1) {
        this.pathArray[yi * width + xi] = [null, null, node];
      }
    }
  }

  public routeEdge(edge: Edge) {
    this.edge = edge;
    this.queue = new FastPriorityQueue<RouteQueueItem>((a, b) => {
      return a[0] < b[0];
    });
    this.routeArray.fill(undefined);
    const width = this.width;
    const source = edge.source;
    const sx = source.x * 6 + 3;
    const sy = source.y * 6 + 3;
    const target = edge.target;
    const tx = target.x * 6 + 3;
    const ty = target.y * 6 + 3;

    let solutionCell: [number, number] = null;

    const sourceCell = (direction: Direction, x: number, y: number) => {
      const cost = turnCost(direction, edge.initialDir) * 2 + lineCost(x) + lineCost(y);
      this.routeArray[y * width + x] = [cost, direction];
      this.queue.add([cost, direction, x, y]);
    };

    for (let x = sx; x <= sx + 2; x += 1) {
      sourceCell(Direction.UP, x, sy);
      sourceCell(Direction.DOWN, x, sy + 2);
    }

    for (let y = sy; y <= sy + 2; y += 1) {
      sourceCell(Direction.LEFT, sx, y);
      sourceCell(Direction.RIGHT, sx + 2, y);
    }

    while (!this.queue.isEmpty() && !solutionCell) {
      const next = this.queue.poll();
      const [cost, direction, x, y] = next;
      // Check if we've reached a target cell
      if (x >= tx && x <= tx + 2 && y >= ty && y <= ty + 2) {
        this.routeArray[y * width + x] = [cost, direction];
        solutionCell = [x, y];
        break;
      }
      this.visitAdjacent(direction, x, y, cost);
    }

    // From solution cell go in reverse order
    if (solutionCell) {
      this.traceSolutionPath(solutionCell);
    }
  }

  private traceSolutionPath(solutionCell: [number, number]) {
    const width = this.width;
    let [x, y] = solutionCell;
    const vertices: Vec2.Vec2[] = [];
    let prevDirection: Direction = null;
    const sx = this.edge.source.x * 6 + 3;
    const sy = this.edge.source.y * 6 + 3;
    let crossing = 0;
    for (;;) {
      const routeCell = this.routeArray[y * width + x];
      if (!routeCell) {
        break;
      }
      let [, direction] = routeCell;
      let newCrossing = crossingDir(direction);
      this.pathArray[y * width + x] = [crossing | newCrossing, this.edge, null];
      crossing = newCrossing;
      // We have reached the source cell
      if (x >= sx && x <= sx + 2 && y >= sy && y <= sy + 2) {
        vertices.push(Vec2.create(x, y));
        break;
      }
      // Otherwise, check if we have made a turn.
      if (direction !== prevDirection) {
        prevDirection = direction;
        vertices.push(Vec2.create(x, y));
      }
      x -= DIR_DX[direction];
      y -= DIR_DY[direction];
    }

    // console.log(vertices);
    this.edge.vertices = vertices.reverse();
  }

  private visitAdjacent(direction: Direction, x: number, y: number, cost: number) {
    // Cost of turning is 1 extra, plus additional costs if the turn is not
    // in the center of a 3x3 cell.
    const turningCost = 3 + lineCost(x) + lineCost(y);
    switch (direction) {
      case Direction.UP:
        this.visit(Direction.UP, x, y - 1, cost + 1);
        this.visit(Direction.LEFT, x - 1, y, cost + turningCost);
        this.visit(Direction.RIGHT, x + 1, y, cost + turningCost);
        break;

      case Direction.DOWN:
        this.visit(Direction.DOWN, x, y + 1, cost + 1);
        this.visit(Direction.LEFT, x - 1, y, cost + turningCost);
        this.visit(Direction.RIGHT, x + 1, y, cost + turningCost);
        break;

      case Direction.LEFT:
        this.visit(Direction.LEFT, x - 1, y, cost + 1);
        this.visit(Direction.UP, x, y - 1, cost + turningCost);
        this.visit(Direction.DOWN, x, y + 1, cost + turningCost);
        break;

      case Direction.RIGHT:
        this.visit(Direction.RIGHT, x + 1, y, cost + 1);
        this.visit(Direction.UP, x, y - 1, cost + turningCost);
        this.visit(Direction.DOWN, x, y + 1, cost + turningCost);
        break;
    }
  }

  private visit(direction: Direction, x: number, y: number, cost: number) {
    const width = this.width;
    const height = this.height;
    if (x >= 0 && x <= width && y >= 0 && y < height) {
      const pathCell = this.pathArray[y * width + x];
      if (pathCell) {
        // Cell is either occupied by an edge or a node.
        const [crossing, edge2, node] = pathCell;
        // If it's a node, we can't enter it unless it is the target node.
        if (node && node !== this.edge.target) {
          return;
        }
        if (edge2 &&
            edge2.style === this.edge.style &&
            (edge2.source === this.edge.source || edge2.target === this.edge.target)) {
          // Found an existing trace, perhaps join with it
        } else if (edge2) {
          const newCrossing = crossingDir(direction);
          if (crossing & newCrossing) {
            return;
          }
          // return;
        }
        // Otherwise, possibly cross it
        // Otherwise, avoid it.
      }
      const routeCell = this.routeArray[y * width + x];
      if (routeCell) {
        const [oldCost] = routeCell;
        if (oldCost <= cost) {
          return;
        }
      }
      this.routeArray[y * width + x] = [cost, direction];
      this.queue.add([cost, direction, x, y]);
    }
  }
}
