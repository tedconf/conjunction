export default function ArrayType( Type ) {
  return {
    resolve( source, query, context ) {
      if ( source === null || typeof source === 'undefined' ) return source;
      if ( !Array.isArray( source ) ) throw new Error( `Invalid source on ArrayType[${ Type.name }]: ${ source }` );
      
      return Promise.all( source.map( item => Type.resolve( item, query, context ) ) );
    }
  };
}
