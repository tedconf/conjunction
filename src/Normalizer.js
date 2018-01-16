// @flow
import mergeDeepLeft from 'ramda/src/mergeDeepLeft';

import {
  mapObject,
  reduceObject
} from './util/object';

import type {
  RecordKey,
  Repository
} from './Store';

type NodeType = {
  id?: RecordKey,
  [propName: string]: any
};

type RecordReference = {
  __ref: RecordKey
}

type RecordRepository = Repository;

type NormalizedResponse = {
  ref: RecordReference,
  records: RecordRepository
};

/**
 * NOTE: Struggling a little with how to reference objects in relation to the query
 * root, when said objects lack a RecordKey. For now, I'm going to roll with a reference
 * that parallels internal references (internal references relative to an object with
 * a RecordKey): { __ref: 'rel:root/sub' }. The implication is that the root query will
 * have a key of 'rel:root'.
 */

export const ROOT_ID = '__root';

export const normalize = ( node: NodeType, selector: { key: RecordKey } = { key: ROOT_ID }): NormalizedResponse => {
  const key = node.id || selector.key;
  const ref = { __ref: key };

  const branches = mapObject( node, ( nodePropValue, nodePropName ) => {
    if ( typeof nodePropValue !== 'object' || nodePropValue === null ) {
      // TODO: This would be more precise if type was determined by the schema, rather than inspection of the node.
      return {
        ref: nodePropValue,
        records: {}
      };
    }
    else if ( Array.isArray( nodePropValue ) ) {
      const nodes = nodePropValue.map( ( nodeItem, index ) => normalize( nodeItem, { key: `${ key }:${ nodePropName }:${ index }` } ) );

      return {
        ref: nodes.map( ({ ref }) => ref ),
        records: nodes.reduce( ( acc, { records }) => mergeDeepLeft( acc, records ), {})
      }
    }
    else {
      return normalize( nodePropValue, { key: `${ key }:${ nodePropName }` } );
    }
  });

  const fields = mapObject( branches, ({ ref }) => ref );

  const record = {
    __key: key,
    ...fields
  };

  return {
    ref,
    records: mergeDeepLeft(
      reduceObject( branches, ( acc, { records }) => mergeDeepLeft( acc, records ), {}),
      { [key]: record }
    )
  };
}
