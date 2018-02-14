// @flow
import { mergeDeepRight } from 'ramda';

import pipe from 'callbag-pipe';
import map from 'callbag-map';
import makeSubject from 'callbag-behavior-subject';
import subscribe from 'callbag-subscribe';

import type {
  Selector,
  RecordMap,
  Updater
} from './__flowtypes';

type CallbagSource = ( type: 0 | 1 | 2, data: any ) => void;

type StoreInterface = {
  changes: ( Selector ) => CallbagSource,
  update: ( ( RecordMap ) => RecordMap ) => void
};

/**
 * Store
 */
export const Store = ( schema: any ): StoreInterface => {
  // A map (key:value) of normalized objects representing the visible state graph.
  let records: RecordMap = {};

  // An Observale emits the entire normalized store on each change. For internal use.
  let updates = makeSubject({});

  // In development environments, subscribe to changes on the log them to the console.
  if ( process.env.NODE_ENV !== 'production' ) {
    pipe(
      updates,
      subscribe({
        next: state => console.log( '[Conjunction::Store]', state ),
        error: err => console.error( err )
      })
    );
  }

  return {
    /**
     * Merge updated records into the store.
     */
    update( updater: Updater ): void {
      records = mergeDeepRight( records, updater( records ) );

      updates( 1, records );
    },

    changes( selector: Selector ): CallbagSource {
      // TODO: Filter updates based on required nodes (selector).
      return pipe(
        updates,
        map( records => schema.traverse( selector, records ) )
      );
    }
  };
};

export default Store;
