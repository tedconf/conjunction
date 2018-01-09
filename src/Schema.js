export function Schema({ query, mutation, catch: errorHandler }) {
  return {
    query( queryDef, context = {} ) {
      return query.resolve( undefined, queryDef, context )
        .catch( errorHandler );
    },

    mutate( mutationDef, context = {} ) {
      return mutation.resolve( undefined, mutationDef, context );
    }
  };
}

export * from './types';
