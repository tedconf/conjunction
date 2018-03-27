// @flow
import { mergeDeepLeft } from 'ramda';

import type {
  NormalizedResponse,
  Selector,
  RecordMap,
  Snapshot
} from '../__flowtypes';

export function ArrayType( Type ) {
  return {
    resolve( source, query, context ) {
      if ( source === null || typeof source === 'undefined' ) return source;
      if ( !Array.isArray( source ) ) throw new Error( `Invalid source on ArrayType[${ Type.name }]: ${ source }` );

      return Promise.all( source.map( item => Type.resolve( item, query, context ) ) );
    },

    normalize( data: any, path: string ): NormalizedResponse {
      if ( typeof Type !== 'object' || typeof Type.normalize !== 'function' ) throw new Error( `Normalization failed. Invalid array type at ${ path }.` );

      if ( data === null || typeof data === 'undefined' ) {
        return {
          ref: data,
          records: {}
        };
      }

      const items = data.map( ( item, index ) => Type.normalize( item, `${ path }:${ index }`) );

      return {
        ref: items.map( ({ ref }) => ref ),
        records: items.reduce( ( acc, { records }) => mergeDeepLeft( acc, records ), {})
      };
    },

    traverse( selector: Selector, records: RecordMap ): Snapshot {
      if ( typeof Type !== 'object' || typeof Type.normalize !== 'function' ) throw new Error( `Traversal failed. Invalid array type.` );

      const { ref: arr, fragment } = selector;

      if ( !arr ) return {
        selector,
        graph: arr
      };

      const items = arr.map( ( ref ) => Type.traverse({ ref, fragment }, records ) );

      return {
        selector,
        graph: items.map( ({ graph }) => graph )
      }
    }
  };
}
