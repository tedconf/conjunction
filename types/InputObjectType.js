export const InputObjectType = ({ name, fields }) => {
  // TODO: Validate field definitions.

  return {
    resolve: ( input ) => {
      const fieldDefs = typeof fields === 'function' ? fields() : fields;

      console.log( `InputObjectType[${ name }].resolve():`, input, fieldDefs );

      if ( typeof input !== 'object' ) {
        throw new Error( `Invalid input for ${ name }.resolve(): ${ typeof input }` );
      }

      if ( input === null ) {
        return Promise.resolve( input );
      }

      const resolvers = Object.keys( fieldDefs )
        .map( key => {
          const { resolve, type } = fieldDefs[key];

          if ( !type || typeof type !== 'object' ) throw new Error( `Invalid type declaration on InputObjectType[${ name }].${ key }` );

          return Promise.resolve( resolve ? resolve( input ) : input[key] )
            .then( value => type.resolve ? type.resolve( value ) : value )
            .then( value => ([
              key,
              value
            ]));
        });

      return Promise.all( resolvers )
        .then( responses => responses.reduce( ( acc, [key, value] ) => ({
          ...acc,
          [key]: value
        }), {}));
    }
  };
}

export default InputObjectType;
