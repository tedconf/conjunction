export const GUIDType = typename => ({
  resolve: ( source ) => Promise.resolve( btoa( `${ typename }:${ source }` ) )
});
