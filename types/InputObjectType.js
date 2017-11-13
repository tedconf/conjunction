export const InputObjectType = ({ name, fields }) => {
  // TODO: Validate field definitions.
  
  return {
    resolve: ( input ) => {
      const fieldDefs = typeof fields === 'function' ? fields() : fields;

      console.log( `InputObjectType[${ name }].resolve():`, input, fieldDefs );

      if ( typeof input !== 'object' ) {
        throw new Error( `Invalid input for ${ name }.resolve(): ${ typeof input }` );
      }

      return Object.keys( fieldDefs ).reduce( ( acc, key ) => {
        const fieldDef = fieldDefs[key];

        return {
          ...acc,
          [key]: fieldDef.resolve ? fieldDef.resolve( input ) : input[key]
        };
      }, {});
    }
  };
}

export default InputObjectType;
