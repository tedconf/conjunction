// @flow
import mergeDeepRight from 'ramda/src/mergeDeepRight';

import {
  Observable
} from './Rx/Observable';

import {
  BehaviorSubject
} from './Rx/Subject';

export type FieldMap = {
  [fieldname: string]: true | Fragment
};

export type Fragment = {
  __on?: string,
  __fields: FieldMap
};

export type RecordKey = string;

export type Record = {
  __key: RecordKey,
  __typename: string,
  [fieldname: string]: mixed
};

export type Selector = {
  fragment: Fragment,
  key: RecordKey
};

export type Repository = {
  [recordKey: RecordKey]: Record
};

export type Snapshot = {
  selector?: Selector,
  data: mixed,
  nodes: Array<RecordKey>
};

export type Observer = {
  next: ( data: mixed ) => any,
  error: ( err: any ) => any
};

export type Subscription = {
  unsubscribe: ( void ) => void
};

export type StoreInterface = {
  put: ( Repository ) => Promise<*>,
  get: ( Selector ) => Snapshot,
  changes: ( Selector ) => Observable
};

export const Store = (): StoreInterface => {
  let records: Repository = {};
  let updates = new BehaviorSubject({});

  function resolveField( prop: mixed, fragment: Fragment | true ): Snapshot {
    // NOTE: This is going to cause problems if types that shouldn't be traversed are represented as arrays (e.g., tuples).
    if ( Array.isArray( prop ) ) {
      return prop
        .map( item => resolveField( item, fragment ) )
        .reduce( ( acc, { data, nodes }) => ({
          data: [
            ...acc.data,
            data
          ],
          nodes: [
            ...acc.nodes,
            ...nodes
          ]
        }), { data: [], nodes: [] });
    }
    else if ( typeof prop === 'object' && prop != null ) {
      // Any object should have been normalized and replaced with a { __ref: '...' }. If that's not the case, it's in error.
      if ( typeof prop.__ref !== 'string' ) throw new Error( `Expected a { __ref: string }. Encountered ${ JSON.stringify( prop, null, 2 ) }` );
      if ( typeof fragment !== 'object' ) throw new Error( 'The fragment must include fields on the object.' );

      return resolveNode( prop.__ref, fragment );
    }
    else {
      return {
        data: prop,
        nodes: []
      };
    }
  }

  function resolveNode( key: RecordKey, fragment: Fragment ): Snapshot {
    const record = records[key];

    if ( !record ) throw new Error( `Failed to resolve record ${ key }.` );

    const { __key, __typename, ...props } = record;
    const { __fields } = fragment;

    const { data, nodes } = Object.keys( __fields ).reduce( ( acc, key ) => {
      const prop = props[key];

      if ( typeof prop === 'undefined' ) throw new Error( `Failed to resolve field ${ key } on ${ __typename }[${ __key }]` );

      const { data, nodes } = resolveField( prop, __fields[key] );

      return {
        data: {
          ...acc.data,
          [key]: data
        },
        nodes: [
          ...new Set([...acc.nodes, ...nodes])
        ].sort()
      };
    }, { data: {}, nodes: [key] });

    return {
      data,
      nodes
    };
  }

  function get( selector: Selector ): Snapshot {
    const { key, fragment } = selector;

    return {
      selector,
      ...resolveNode( key, fragment )
    };
  }

  return {
    put( updatedRecords: Repository ): Promise<*> {
      records = mergeDeepRight( records, updatedRecords );

      updates.next( updatedRecords );

      return Promise.resolve( null ); // TODO: Handle the case where updates are deferred or batched.
    },

    get,

    changes( selector: Selector ): Observable {
      // TODO: Filter updates based on required nodes.
      return updates
        .map( () => get( selector ) )
        .map( ({ data }) => data );
    }
  };
};

export default Store;
