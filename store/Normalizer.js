// @flow
type Node = {
  id?: string
};

type Selector = {
  key: string
};

/**
 * NOTE: Struggling a little with how to reference objects in relation to the query
 * root, when said objects lack a RecordKey. For now, I'm going to roll with a reference
 * that parallels internal references (internal references relative to an object with
 * a RecordKey): { __ref: 'rel:root/sub' }. The implication is that the root query will
 * have a key of 'rel:root'.
 */

export const ROOT_ID = 'rel:root';

export const normalize = ( selector: Selector, node: Node ) => {
  const { key } = selector;

  const root = { __ref: node.id || key };

  return {
    root
  };
}
