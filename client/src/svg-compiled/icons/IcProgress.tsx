import * as React from "react";

const SvgIcProgress = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width={32} height={32} viewBox="0 0 8.5 8.5" {...props}>
    <rect
      width={1.594}
      height={7.969}
      x={0.266}
      y={0.266}
      ry={0.531}
      fill="#151515"
    />
    <rect
      width={1.594}
      height={7.969}
      x={2.391}
      y={0.266}
      ry={0.531}
      fill="#151515"
    />
    <rect
      width={1.594}
      height={3.984}
      x={4.516}
      y={0.266}
      ry={0.531}
      fill="#151515"
    />
    <rect
      width={1.594}
      height={5.578}
      x={6.641}
      y={0.266}
      ry={0.531}
      fill="#151515"
    />
  </svg>
);

export default SvgIcProgress;
