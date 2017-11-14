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
        .map( key => Promise.resolve( fieldDefs[key].resolve ? fieldDefs[key].resolve( input ) : input[key] )
          .then( value => ([
            key,
            value
          ]))
        );

      return Promise.all( resolvers )
        .then( responses => responses.reduce( ( acc, [key, value] ) => ({
          ...acc,
          [key]: value
        }), {}));
    }
  };
}

export default InputObjectType;
