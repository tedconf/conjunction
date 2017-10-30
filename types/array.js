export default function ArrayType( Type ) {
  return {
    resolve( source, query ) {
      // TODO: Validate that source is an array.
      return Promise.all( source.map( item => Type.resolve( item, query ) ) );
    }
  };
}
