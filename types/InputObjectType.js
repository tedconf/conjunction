export const InputObjectType = ({ name, fields }) => {
  // TODO: Validate field definitions.

  return {
    resolve: ( input ) => {
      const fieldDefs = typeof fields === 'function' ? fields() : fields;

      console.log( `InputObjectType[${ name }].resolve():`, input, fieldDefs );

      if ( typeof input !== 'object' ) {
        throw new Error( `Invalid input for ${ name }.resolve(): ${ typeof input }` );
      }

      const resolvers = Object.keys( fieldDefs )
        .map( key => {
          const { resolve, type } = fieldDefs[key];

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
