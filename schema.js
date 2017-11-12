export function Schema({ query, mutation }) {
  return {
    query( queryDef, context = {} ) {
      return query.resolve( undefined, queryDef, context );
    },

    mutate( mutationDef, context = {} ) {
      console.log( 'Schema.mutate:', mutation, mutationDef );
      
      return mutation.resolve( undefined, mutationDef, context );
    }
  };
}

export * from './types';
