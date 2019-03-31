import * as React from 'react';
import * as copy from 'copy-to-clipboard';

import LinkIcon from '../svg-compiled/icons/IcLink';
import { Button } from 'skyhook-ui';

interface Props {
  url: string;
  title?: string;
}

export function CopyLink(props: Props) {
  const { title, url } = props;
  const onClick = (e: any) => {
    e.preventDefault();
    (copy as any).default(url);
  };

  return (
    <Button
        variant="default"
        className="copy-link"
        title={title || 'Copy link to clipboard'}
        onClick={onClick}
    >
      <LinkIcon />
    </Button>
  );
}
