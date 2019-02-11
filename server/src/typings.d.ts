// Inform typescript about .json imports
declare module '*.json' {
  const value: any;
  export default value;
}
