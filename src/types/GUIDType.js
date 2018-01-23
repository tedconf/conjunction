import { ScalarType } from './ScalarType';

export const GUIDType = typename => ({
  ...ScalarType,
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

export const GUIDInputType = {
  resolve: id => Promise.resolve( id && decode( id ).id )
};

export const decodeGUID = decode;
