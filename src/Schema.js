// @flow

export type SchemaType = {
  query: ( any, any ) => Promise<*>,
  mutate: ( any, any ) => Promise<*>
};

type FactoryProps = {
  query: any,
  mutation?: any,
  catch?: ( any ) => any
};

export function Schema({ query, mutation, catch: errorHandler }: FactoryProps ): SchemaType {
  return {
    query( queryDef, context = {} ) {
      return query.resolve( undefined, queryDef, context )
        .catch( errorHandler );
    },

    mutate( mutationDef, context = {} ) {
      if ( !mutation ) throw new Error( 'No mutation defined.' );

      return mutation.resolve( undefined, mutationDef, context )
        .then( graph => ({
          graph,
          ...mutation.normalize( graph, '__mutation' )
        }))
        .catch( errorHandler );
    },

    normalize: query.normalize,
    traverse: query.traverse
  };
}

export * from './types';
