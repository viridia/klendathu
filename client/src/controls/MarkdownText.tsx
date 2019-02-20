import * as React from 'react';
import * as marked from 'marked';

// Global options for marked.
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
});

interface Props {
  content: string;
  className?: string;
}

export function MarkdownText({ content, className }: Props) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />;
}
