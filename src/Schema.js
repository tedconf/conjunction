// @flow

export type SchemaType = {
  query: ( any, any ) => Promise<*>,
  mutate: ( any, any ) => Promise<*>
};

export function Schema({ query, mutation, catch: errorHandler }): SchemaType {
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
