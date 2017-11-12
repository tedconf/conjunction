const defaultFieldSource = ( parent, fieldName ) => {
  const field = parent[fieldName];

  return field && ( typeof field === 'function' ) ? field.call( parent ) : field;
}

export default function ObjectType({ name, fields = {} } = {}) {
  return {
    // TODO: Rename to "execute" to avoid confusion. Fields will have custom "resolvers."
    resolve( source, query, context = {} ) {
      const _fields = typeof fields === 'function' ? fields() : fields;
      const keys = Object.keys( query );

      // If the source is null, then do not proceed with deeper resolution.
      if ( source === null ) {
        return Promise.resolve( source );
      }

      // Pass the source to the field resolver for each field that is represented in the query,
      // then recurse by taking the result as the "source" relevant to fields on that
      // source (if that node has fields).

      const resolvers = keys.map( key => {
        const fieldDef = _fields[key];
        const queryParams = query[key];

        if ( !fieldDef || !fieldDef.type ) {
          return Promise.reject( new Error( `Could not resolve a query including an undefined field. The field '${ key }' is not defined on ${ name }(${ Object.keys( _fields ).join( ', ' ) }).` ) );
        }

        const { source: fieldSource, type: fieldType } = fieldDef;

        // TODO: Validate query arguments: queryParams.args should match fieldDef.args.

        if ( typeof source === 'undefined' ) {
          console.warn( `Attempt to resolve field '${ key }' on ${ name } with undefined source.` )
        }

        return Promise.resolve( fieldSource ? fieldSource( source, queryParams.args, context ) : defaultFieldSource( source, key ) )
          .then( value => fieldType.resolve( value, typeof queryParams === 'object' ? queryParams.fields : queryParams, context ) )
          .then( value => [
            key,
            value
          ]);
      });

      return Promise.all( resolvers )
        .then( results => results.reduce( ( acc, [key, value ]) => ({
          ...acc,
          [key]: value
        }), {}) )
    }
  };
}
