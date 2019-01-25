// Inform typescript about .svg imports
declare module '*.svg' {
  const _: string;
  export default _;
}
// Inform typescript about .png imports
declare module '*.png';
