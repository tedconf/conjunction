const defaultFieldResolver = ( parent, fieldName ) => {
  const field = parent[fieldName];

  return field && ( typeof field === 'function' ) ? field.call( parent ) : field;
}

export const resolveArgs = ( args = {}, argDefs = {} ) => {
  const resolvers = Object.keys( args ).map( key => {
    return Promise.resolve( argDefs[key].resolve( args[key] ) )
      .then( value => ([
        key,
        value
      ]))
  });

  return Promise.all( resolvers )
    .then( results => results.reduce( ( acc, [key, value]) => ({
      ...acc,
      [key]: value
    }), {}));
};

export function ObjectType({ name, fields = {} } = {}) {
  return {
    resolve( source, query, context = {} ) {
      if ( process.env.NODE_ENV !== 'production' ) {
        console.log( `ObjectType[${ name }].resolve():`, source, query );
      }

      // A fields thunk, if it exists, has to be resolved after all dependencies are defined... so on nextTick (assuming dependencies are loaded synchronously) or later.
      const _fields = typeof fields === 'function' ? fields() : fields;

      // Check ObjectType definition.
      if ( process.env.NODE_ENV !== 'production' ) {
        if ( !_fields || typeof _fields !== 'object' ) throw new Error( `An ObjectType[${ name }] cannot be defined without fields.` );

        Object.keys( _fields ).forEach( fieldName => {
          const fieldDef = _fields[fieldName];

          if ( !fieldDef || typeof fieldDef !== 'object' ) throw new Error( `Field '${ fieldName }' on ObjectType[${ name }] has an invalid definition.` );

          const { type: fieldType } = fieldDef;

          if ( !fieldType || typeof fieldType !== 'object' || typeof fieldType.resolve !== 'function' ) {
            throw new Error( `Invalid field type on ObjectType[${ name }].${ fieldName }.` );
          }
        });
      }

      if ( typeof query !== 'object' ) {
        throw new Error( `Cannot resolve invalid query on ${ name }.` );
      }

      const keys = Object.keys( query.__fields );

      // If the source is null, then do not proceed with deeper resolution.
      if ( source === null ) {
        return Promise.resolve( source );
      }

      // Pass the source to the field resolver for each field that is represented in the query,
      // then recurse by taking the result as the "source" relevant to fields on that
      // source (if that node has fields).

      const resolvers = keys.map( key => {
        const fieldDef = _fields[key];
        const queryParams = query.__fields[key];

        if ( !fieldDef || !fieldDef.type ) {
          return Promise.reject( new Error( `Could not resolve a query including an undefined field. The field '${ key }' is not defined on ${ name }(${ Object.keys( _fields ).join( ', ' ) }).` ) );
        }

        const { resolve: fieldResolver, type: fieldType, args: fieldArgs } = fieldDef;

        // TODO: Validate query arguments: queryParams.args should match fieldDef.args.

        if ( typeof source === 'undefined' && process.env.NODE_ENV !== 'production' ) {
          console.warn( `Attempt to resolve field '${ key }' on ${ name } with undefined source.` )
        }

        return resolveArgs( queryParams.__args, fieldArgs )
          .then( args => fieldResolver ? fieldResolver( source, args, context ) : defaultFieldResolver( source, key ) )
          .then( value => fieldType.resolve( value, queryParams, context ) )
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

export default ObjectType;
