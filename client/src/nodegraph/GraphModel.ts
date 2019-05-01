import { Node } from './Node';
import { Edge, EdgeStyle, Direction } from './Edge';
import * as Vec2 from './Vec2';
import { computed, IObservableArray, observable } from 'mobx';
import { ReachableIssue } from '../../../common/types/graphql';
import { PathRouter } from './PathRouter';

export interface Layout {
  nodes: Node[];
  edges: Edge[];
  width: number;
  height: number;
}

export class GraphModel {
  // Observable map of reachability data. We use a map so that query order doesn't matter.
  @observable private data = [] as IObservableArray<ReachableIssue>;

  constructor(
      private nodeHeight: number,
      private nodeWidth: number,
      private nodeXSpacing: number,
      private nodeYSpacing: number)
  {}

  public setNodes(issues: ReachableIssue[]) {
    this.data.replace(issues);
  }

  @computed
  public get layout(): Layout {
    if (this.data.length === 0) {
      return null;
    }

    // For some reason the 'parents' property isn't always filled in during loading.
    const all = Array.from(this.data).filter(item => 'parents' in item);
    if (all.length === 0) {
      return null;
    }
    const allMap = new Map(all.map(ri => [ri.issue.id, ri] as [string, ReachableIssue]));
    const roots: ReachableIssue[] = [];
    const canReachRoot = new Map<string, boolean>();
    const nodeXStride = this.nodeXSpacing + this.nodeWidth;
    const nodeYStride = this.nodeYSpacing + this.nodeHeight;

    function traceRoots(id: string) {
      if (canReachRoot.has(id)) {
        return canReachRoot.get(id);
      }
      const ri = allMap.get(id);
      if (ri) {
        // Start by assuming we can't reach the root. This is to prevent cycles from creating
        // an infinite loop.
        canReachRoot.set(id, false);

        // Try to reach any root via the links we have.
        for (const iss of ri.blockedBy) {
          if (traceRoots(iss)) {
            canReachRoot.set(id, true);
            return true;
          }
        }
        for (const iss of ri.parents) {
          if (traceRoots(iss)) {
            canReachRoot.set(id, true);
            return true;
          }
        }
        for (const iss of ri.related) {
          if (traceRoots(iss)) {
            canReachRoot.set(id, true);
            return true;
          }
        }

        // Couldn't reach any root, so make this a root.
        roots.push(ri);
        canReachRoot.set(id, true);
        return true;
      }
    }
    all.forEach(ri => traceRoots(ri.issue.id));

    // Helper function to create a Node for each reachable issue, which also assigns it a
    // sequence number and stores it in the node map.
    let nextIndex = 0;
    const nodeMap = new Map<string, Node>();
    function makeNode(ri: ReachableIssue): Node {
      let n = nodeMap.get(ri.issue.id);
      if (n) {
        return n;
      }
      n = new Node(ri, nextIndex++);
      nodeMap.set(ri.issue.id, n);
      return n;
    }

    // The top-level list of nodes
    const rootList = roots.map(ri => makeNode(ri));

    function bestNodeToAttach(items: string[]): Node {
      let bestNode: Node = null;
      let bestScore = 10000;
      for (const id of items) {
        const n = nodeMap.get(id);
        if (n && n.index < bestScore) {
          bestNode = n;
          bestScore = n.index;
        }
      }
      return bestNode;
    }

    // Go through the rest of the items. Each item may have more than one parent, or more
    // than one blocker; we want to find the 'best' parent or blocker, that being the one
    // with the lowest sequence number. Then create a new node and attach it to that node.
    // If it cannot be attached, then put it at the end of the queue and try again.
    let itemsToPlace = all.filter(ri => !nodeMap.has(ri.issue.id));
    let itemsNotPlaced: ReachableIssue[] = [];
    for (;;) {
      for (const ri of itemsToPlace) {
        if (ri.parents) {
          // Find the parent with the lowest priority index, and place it beneath that parent.
          const bestParent = bestNodeToAttach(ri.parents);
          if (bestParent) {
            bestParent.bottom.push(makeNode(ri));
            continue;
          }
        }

        if (ri.blockedBy) {
          // Find the predecessor with the lowest priority index and place it to the right.
          const bestPred = bestNodeToAttach(ri.blockedBy);
          if (bestPred) {
            bestPred.right.push(makeNode(ri));
            continue;
          }
        }

        // If either of these failed, it means that the parent or predecessor nodes have
        // not yet been placed. Put them on a list to retry later.
        itemsNotPlaced.push(ri);
      }

      // If there are no more items to place, we're done
      if (itemsNotPlaced.length === 0) {
        break;
      }

      // We went through the entire list and couldn't place anything. In that case,
      // just arbitrarily place the first item on the root list and try again. (It may be
      // because of cyclic dependency)
      if (itemsNotPlaced.length === itemsToPlace.length) {
        const first = itemsNotPlaced.shift();
        rootList.push(makeNode(first));
      }

      // In any case, try again with the updated list of items to place. It should be able to
      // make progress now that more parent / predecessor nodes have been added to the graph.
      itemsToPlace = itemsNotPlaced;
      itemsNotPlaced = [];
    }

    function computeNodeSize(n: Node, x: number, y: number) {
      n.x = x;
      n.y = y;
      n.layoutWidth = 1;
      n.layoutHeight = 1;

      // Look at all the subnodes to the left. Expand this node's size to include all of the
      // widths as well as the tallest height.
      for (const sn of n.right) {
        computeNodeSize(sn, x + n.layoutWidth, y);
        n.layoutWidth += sn.layoutWidth;
        n.layoutHeight = Math.max(n.layoutHeight, sn.layoutHeight);
      }

      // Now look at all the nodes below.
      const firstRowHeight = n.layoutHeight;
      let nextRowWidth = 0;
      let nextRowHeight = 0;
      for (const sn of n.bottom) {
        computeNodeSize(sn, x + nextRowWidth, y + n.layoutHeight);
        nextRowHeight = Math.max(nextRowHeight, sn.layoutHeight);
        nextRowWidth += sn.layoutWidth;
      }
      n.layoutWidth = Math.max(n.layoutWidth, nextRowWidth);
      n.layoutHeight = firstRowHeight + nextRowHeight;
    }

    // Compute size and position for all nodes
    let width = 0;
    let height = 0;
    for (const node of rootList) {
      computeNodeSize(node, width, 0);
      width += node.layoutWidth;
      height = Math.max(height, node.layoutHeight);
    }

    const router = new PathRouter(
      width * nodeXStride + this.nodeXSpacing,
      height * nodeYStride + this.nodeYSpacing);

    const edges: Edge[] = [];
    const addEdge = (source: Node, target: Node, style: EdgeStyle) => {
      // Don't add related edges in both directions.
      let initialDir = Direction.DOWN;
      if (style === EdgeStyle.RELATED) {
        const reverseId = `${target.id}-${source.id}-${style}`;
        if (edges.find(edge => edge.id === reverseId)) {
          return;
        }
        initialDir = Direction.RIGHT;
      } else if (style === EdgeStyle.PRED) {
        initialDir = Direction.RIGHT;
      }

      edges.push({
        id: `${source.id}-${target.id}-${style}`,
        source: source,
        target: target,
        style: style,
        initialDir,
        vertices: [
          Vec2.create(
            source.x * nodeXStride + this.nodeXSpacing + 1,
            source.y * nodeYStride + this.nodeYSpacing + 1),
          Vec2.create(
            target.x * nodeXStride + this.nodeXSpacing + 1,
            target.y * nodeYStride + this.nodeYSpacing + 1),
        ],
        verticesTransformed: [],
      });
    };

    // Add nodes and edges
    nodeMap.forEach(node => {
      router.addNode(node,
        node.x * nodeXStride + this.nodeXSpacing,
        node.y * nodeYStride + this.nodeYSpacing,
        this.nodeWidth,
        this.nodeHeight);
      node.data.blockedBy.forEach(id => {
        const target = nodeMap.get(id);
        if (target) {
          addEdge(target, node, EdgeStyle.PRED);
        }
      });

      node.data.parents.forEach(id => {
        const target = nodeMap.get(id);
        if (target) {
          addEdge(target, node, EdgeStyle.PARENT);
        }
      });

      node.data.related.forEach(id => {
        const target = nodeMap.get(id);
        if (target) {
          addEdge(target, node, EdgeStyle.RELATED);
        }
      });
    });

    edges.forEach(edge => { router.routeEdge(edge); });

    // Now flatten the map of all nodes into a list
    return {
      nodes: Array.from(nodeMap.values()),
      edges,
      width,
      height,
    };
  }
}
