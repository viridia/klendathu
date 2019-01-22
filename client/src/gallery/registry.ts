import * as React from 'react';

export interface Page {
  caption: string;
  render: () => React.ReactNode;
}

export const registry: { [caption: string]: () => JSX.Element } = {};

export function register(caption: string, render: () => JSX.Element) {
  registry[caption] = render;
}
