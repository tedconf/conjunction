export function Schema({ query }) {
  return {
    query( queryDef ) {
      return query.resolve( undefined, queryDef );
    }
  };
}

export * from './types';
