// @flow
import test from 'tape';

import {
  ROOT_ID,
  normalize
} from './Normalizer';

test.only( "connect/store/Normalizer.normalize()...", sub => {
  sub.test( "...node with id.", assert => {
    const data = {
      group: {
        id: 'R3JvdXA6MDAwMDE=',
        name: 'TEDxSebastopol'
      }
    };

    const { root } = normalize( { key: ROOT_ID }, data );

    const expectedRoot = { __ref: ROOT_ID };

    assert.deepEqual( root, expectedRoot, 'The normalize() method should return the correct root.' );
    assert.end();
  });
});
