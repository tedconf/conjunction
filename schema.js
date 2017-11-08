export function Schema({ query }) {
  return {
    query( queryDef, context = {} ) {
      return query.resolve( undefined, queryDef, context );
    }
  };
}

export * from './types';
