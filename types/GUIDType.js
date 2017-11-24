export const GUIDType = typename => ({
  resolve: ( source ) => Promise.resolve( btoa( `${ typename }:${ source }` ) )
});

const decode = ( encodedId ) => {
  const [type, id] = atob( encodedId ).split( ':' );

  return {
    type,
    id
  };
};

GUIDType.decode = decode;

export const GUIDInputType = ({
  resolve: id => decode( id ).id
});
