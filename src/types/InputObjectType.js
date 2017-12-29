export const InputObjectType = ({ name, fields }) => {
  // TODO: Validate field definitions.

  return {
    resolve: ( input ) => {
      const fieldDefs = typeof fields === 'function' ? fields() : fields;

      console.log( `InputObjectType[${ name }].resolve():`, input, fieldDefs );

      // Seems that--especially in the case of inputs--we want to support partial inputs...
      // ...e.g., what if I just want to patch something: shouldn't I be able to just input the fields I want to change?
      if ( typeof input === 'undefined' || input === null ) {
        return Promise.resolve( input );
      }

      if ( typeof input !== 'object' ) {
        throw new Error( `Invalid input for ${ name }.resolve(): ${ typeof input }` );
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
