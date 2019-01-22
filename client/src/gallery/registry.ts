export const registry: { [caption: string]: () => JSX.Element } = {};

export function register(caption: string, render: () => JSX.Element) {
  registry[caption] = render;
}
