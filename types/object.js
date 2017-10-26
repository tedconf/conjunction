const defaultFieldSource = ( parent, fieldName ) => {
  const field = parent[fieldName];

  return field && ( typeof field === 'function' ) ? field.call( parent ) : field;
}

export default function ObjectType({ name, fields = {} } = {}) {
  return {
    resolve( source, query ) {
      const keys = Object.keys( query );

      // Pass the source to the field resolver for each field that is represented in the query,
      // then recurse by taking the result as the "source" relevant to fields on that
      // source (if that node has fields).

      const resolvers = keys.map( key => {
        const fieldDef = fields[key];

        if ( !fieldDef || !fieldDef.type ) return Promise.reject( new Error( 'Could not resolve a query including an undefined field.' ) );

        const { source: fieldSource, type: fieldType } = fieldDef;

        return Promise.resolve( fieldSource && fieldSource( source ) || defaultFieldSource( source, key ) )
          .then( value => fieldType.resolve( value, typeof query[key] === 'object' ? query[key].fields : query[key] ) )
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
    },

    field( name ) {
      return fields[name];
    }
  };
}
