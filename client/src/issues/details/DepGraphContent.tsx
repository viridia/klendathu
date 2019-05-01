import * as React from 'react';
import { Observer } from 'mobx-react-lite';
import { GraphModel } from '../../nodegraph/GraphModel';
import { styled } from '../../style';
import { idToIndex } from '../../lib/idToIndex';
import classNames from 'classnames';
import { ProjectEnv } from '../../models';
import { Node, Edge, EdgeStyle, Vec2 } from '../../nodegraph';
import { shade } from 'polished';

type Vec2 = Vec2.Vec2;

const BOX_WIDTH = 50;
const BOX_HEIGHT = 20;
const BOX_SPACING = 24;
const CURVE_LENGTH = 9;
const ARROW_LENGTH = 5;
const ARROW_WIDTH = 5;

function displace(p0: Vec2, p1: Vec2, amount: number) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  return [
    p0[0] + dx * amount / length,
    p0[1] + dy * amount / length,
  ];
}

function arrow(p0: Vec2, p1: Vec2): Vec2[] {
  const p2 = displace(p0, p1, ARROW_LENGTH);
  const dx = 0.5 * (p0[0] - p2[0]);
  const dy = 0.5 * (p0[1] - p2[1]);
  return [
    p0,
    [p2[0] - dy, p2[1] + dx],
    [p2[0] + dy, p2[1] - dx],
  ];
}

const DepGraphLayout = styled.section`
  background-color: ${p => p.theme.commentHeaderColor};
  border: 1px solid ${p => p.theme.commentBorderColor};
  border-radius: 3px;
  position: relative;
  overflow-x: auto;
`;

const NodeEl = styled.div`
  align-items: center;
  background-color: ${p => p.theme.cardBgColor};
  border: 1px solid ${p => p.theme.commentBorderColor};
  border-radius: 2px;
  box-shadow: 0px 1px 3px 1px ${props => props.theme.shadowColor};
  display: flex;
  flex-direction: row;
  font-size: .75rem;
  justify-content: center;
  height: ${BOX_HEIGHT}px;
  position: absolute;
  width: ${BOX_WIDTH}px;

  &.selected {
    border-width: 2px;
    border-color: ${p => p.theme.cardBorderColor};
    height: ${BOX_HEIGHT - 2}px;
    width: ${BOX_WIDTH - 2}px;
  }

  &.closed {
    opacity: 0.7;
    color: ${p => p.theme.textMuted};
  }
`;

const Routes = styled.svg`
  position: absolute;

  & path.edge {
    stroke-width: 1px;
    fill: none;

    &.parent {
      stroke: #555;
    }

    &.pred {
      stroke: #777;
      stroke-dasharray: 3;
    }

    &.related {
      stroke: #aaf;
      stroke-dasharray: 2;
      stroke-width: 1px;
    }
  }

  & circle {
    fill: white;
    stroke-width: 1px;
    stroke: #777;
  }
`;

interface Props {
  graph: GraphModel;
  selected?: string;
}

function edgeX(x: number) {
  const xi = Math.floor(x / 6);
  const xf = x - xi * 6;
  const r = xi * (BOX_SPACING + BOX_WIDTH) +
      (xf < 3
          ? ((xf + 1) * BOX_SPACING / 4)
          : ((xf - 2) * BOX_WIDTH / 4 + BOX_SPACING));
  return Math.floor(r) + 0.5;
}

function edgeY(y: number) {
  const yi = Math.floor(y / 6);
  const yf = y - yi * 6;
  const r = yi * (BOX_SPACING + BOX_HEIGHT) +
      (yf < 3
          ? (yf + 1) * BOX_SPACING / 4
          : (yf - 2) * BOX_HEIGHT / 4 + BOX_SPACING);
  return Math.floor(r) + 0.5;
}

function makePath(vertices: Vec2[], className: string) {
  const d: string[] = [];
  for (let i = 0; i < vertices.length; i += 1) {
    const [x, y] = vertices[i];
    if (i === 0) {
      d.push(`M${x} ${y}`);
    } else {
      d.push(`L${x} ${y}`);
    }
  }
  return <path className={className} d={d.join(' ')} />;
}

function EdgePath({ edge }: { edge: Edge }) {
  const d: string[] = [];
  for (let i = 0; i < edge.verticesTransformed.length; i += 1) {
    const vtx = edge.verticesTransformed[i];
    const [x, y] = edge.verticesTransformed[i];
    if (i === 0) {
      d.push(`M${x} ${y}`);
    } else if (i >= edge.verticesTransformed.length - 1) {
      d.push(`L${x} ${y}`);
    } else {
      const prevVtx = edge.verticesTransformed[i - 1];
      const nextVtx = edge.verticesTransformed[i + 1];
      const [x0, y0] = displace(vtx, prevVtx, CURVE_LENGTH);
      const [x1, y1] = displace(vtx, nextVtx, CURVE_LENGTH);
      d.push(`L${x0} ${y0}`);
      // Curve
      d.push(`C${x} ${y}, ${x} ${y}, ${x1} ${y1}`);
    }
  }
  return <path className={classNames('edge', edge.style)} d={d.join(' ')} />;
}

function EdgeArrow({ edge }: { edge: Edge }) {
  if (edge.style === EdgeStyle.PARENT) {
    const v0 = edge.verticesTransformed[0];
    const v1 = edge.verticesTransformed[1];
    const a = arrow(v0, v1);
    return makePath(a, 'arrow');
  } else if (edge.style === EdgeStyle.PRED) {
    const v0 = edge.verticesTransformed[edge.verticesTransformed.length - 1];
    const v1 = edge.verticesTransformed[edge.verticesTransformed.length - 2];
    const [x0, y0] = v0;
    const [x1, y1] = v1;
    let [x, y] = v0;
    // if (y1 > y0) {
    //   y += 9;
    // } else if (y1 < y0) {
    //   y -= 8;
    // } else if (x1 > x0) {
    //   x += 17;
    // } else if (x1 < x0) {
    //   x -= 15;
    // }
    return <circle cx={x} cy={y} r={2.5} />;
  }
  return null;
}

function clipEdges(node: Node, v0: Vec2, v1: Vec2) {
  const sdx = v1[0] - v0[0];
  const sdy = v1[1] - v0[1];
  if (sdx > 1) {
    const boxRight = (node.x + 1) * (BOX_WIDTH + BOX_SPACING) + 2;
    v0[0] = Math.max(v0[0], boxRight);
  } else if (sdx < -1) {
    const boxLeft = node.x * (BOX_WIDTH + BOX_SPACING) + BOX_SPACING;
    v0[0] = Math.min(v0[0], boxLeft);
  } else if (sdy > 1) {
    const boxBottom = (node.y + 1) * (BOX_HEIGHT + BOX_SPACING) + 2;
    v0[1] = Math.max(v0[1], boxBottom);
  } else if (sdy < -1) {
    const boxTop = node.y * (BOX_HEIGHT + BOX_SPACING) + BOX_SPACING;
    v0[1] = Math.min(v0[1], boxTop);
  }
}

function transformVertices(edges: Edge[]) {
  edges.forEach(edge => {
    edge.verticesTransformed = edge.vertices.map(v => Vec2.create(edgeX(v[0]), edgeY(v[1])));

    // Clip outgoing edges to perimeter of source box
    const s0 = edge.verticesTransformed[0];
    const s1 = edge.verticesTransformed[1];
    clipEdges(edge.source, s0, s1);

    // Clip incoming edges to perimeter of target box
    const e0 = edge.verticesTransformed[edge.verticesTransformed.length - 1];
    const e1 = edge.verticesTransformed[edge.verticesTransformed.length - 2];
    clipEdges(edge.target, e0, e1);
  });
}

export function DepGraphContent({ selected, graph }: Props) {
  const env = React.useContext(ProjectEnv);
  return (
    <Observer>
      {() => {
        const { layout } = graph;
        if (!layout) {
          return null;
        }
        transformVertices(layout.edges);
        const layoutWidth = layout.width * (BOX_WIDTH + BOX_SPACING) + BOX_SPACING;
        const layoutHeight = layout.height * (BOX_HEIGHT + BOX_SPACING) + BOX_SPACING;
        return (
          <DepGraphLayout style={{
            minWidth: `${layoutWidth}px`,
            minHeight: `${layoutHeight}px`,
          }}>
            <Routes
              width={layoutWidth}
              height={layoutHeight}
              viewBox={`0 0 ${layoutWidth} ${layoutHeight}`}
            >
              {layout.edges.map(edge => (
                <React.Fragment key={edge.id}>
                  <EdgePath edge={edge} />
                  <EdgeArrow edge={edge} />
                </React.Fragment>
              ))}
            </Routes>
            {layout.nodes.map(node => {
              const type = env.types.get(node.data.issue.type);
              return (
                <NodeEl
                  key={node.data.issue.id}
                  className={classNames({
                    selected: selected === node.data.issue.id,
                    closed: !env.openStates.has(node.data.issue.state),
                  })}
                  style={{
                    left: `${node.x * (BOX_WIDTH + BOX_SPACING) + BOX_SPACING}px`,
                    top: `${node.y * (BOX_HEIGHT + BOX_SPACING) + BOX_SPACING}px`,
                    backgroundColor: type ? type.bg : undefined,
                    borderColor: type ? shade(0.13, type.bg) : undefined,
                  }}
                >
                  <div className="caption">#{idToIndex(node.data.issue.id)}</div>
                </NodeEl>
              );
            })}
          </DepGraphLayout>
        );
      }}
    </Observer>
  );
}
