export function Schema({ query, mutation }) {
  return {
    query( queryDef, context = {} ) {
      return query.resolve( undefined, queryDef, context );
    },

    mutate( mutationDef, context = {} ) {
      return mutation.resolve( undefined, mutationDef, context );
    }
  };
}

export * from './types';
