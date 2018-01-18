// @flow
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import {
  Observable
} from './Rx/Observable';

import {
  BehaviorSubject
} from './Rx/Subject';

import type {
  Selector,
  RecordMap,
  Updater,
  Snapshot
} from './__flowtypes';

type StoreInterface = {
  changes: ( Selector ) => Observable<RecordMap>,
  update: ( ( RecordMap ) => RecordMap ) => void
};

/**
 * Store
 */
export const Store = ( schema: any ): StoreInterface => {
  // A map (key:value) of normalized objects representing the visible state graph.
  let records: RecordMap = {};

  // An Observale emits the entire normalized store on each change. For internal use.
  let updates = new BehaviorSubject({});

  // In development environments, subscribe to changes on the log them to the console.
  if ( process.env.NODE_ENV !== 'production' ) {
    updates.subscribe({
      next: () => console.log( '[Conjunction::Store]', records )
    });
  }

  return {
    /**
     * Merge updated records into the store.
     */
    update( updater: Updater ): void {
      records = mergeDeepRight( records, updater( records ) );

      updates.next( records );
    },

    changes( selector: Selector ): Observable<Snapshot> {
      // TODO: Filter updates based on required nodes (selector).
      return updates
        .map( records => schema.traverse( selector, records ));
    }
  };
};

export default Store;
