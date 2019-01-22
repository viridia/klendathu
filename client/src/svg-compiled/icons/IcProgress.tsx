import * as React from "react";

const SvgIcProgress = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width={32} height={32} viewBox="0 0 8.5 8.5" {...props}>
    <path
      d="M.1.1v8.2h8.3V.2H0zm.3.3H2v2.1h.3v-2H4v2h.2v-2h1.9v1.7l.3.3v-2H8V8H6.4V6l-.3.2v1.9H4.2V5.9H4v2.2H2.3V5.9H2v2.2H.4V.4zM5 1.6v1.3H1v2.7h4v1.3l2.6-2.7L5 1.6z"
      color="#000"
    />
  </svg>
);

export default SvgIcProgress;
