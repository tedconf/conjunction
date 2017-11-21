// @flow
import { mapObject } from 'util/object';

type Node = {
  id?: string
};

type RecordKey = string;

type Selector = {
  key: string
};

type Record = {};

type RecordReference = {
  __ref: RecordKey
}

type RecordRepository = {
  [key: string]: Record
};

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

export const normalize = ( selector: Selector, node: Node ): NormalizedResponse => {
  console.log( 'normalize():', selector, node );
  const key = node.id || selector.key;
  const ref = { __ref: key };

  const branches = mapObject( node, ( fieldNode, fieldName ) => {
    if ( typeof fieldNode !== 'object' ) {
      // TODO: This would be more precise if type was determined by the schema, rather than inspection of the node.
      return {
        ref: fieldNode,
        records: {}
      };
    }
    else if ( Array.isArray( fieldNode ) ) {
      return {
        ref: [],
        records: {}
      }
    }
    else {
      return normalize({ key: `${ key }:${ fieldName }` }, fieldNode );
    }
  });

  const fields = mapObject( branches, ({ ref }) => ref );

  const record = {
    __key: key,
    ...fields
  };

  return {
    ref,
    records: {
      [key]: record
    }
  };
}
