// @flow
import test from 'tape';

import {
  ROOT_ID,
  normalize
} from './Normalizer';

test.only( "connect/store/Normalizer.normalize()...", sub => {
  sub.test( "...root.", assert => {
    const data = {
      group: {
        id: 'R3JvdXA6MDAwMDE=',
        name: 'TEDxSebastopol'
      }
    };

    const { ref, records } = normalize( { key: ROOT_ID }, data );

    const expectedRef = { __ref: ROOT_ID };
    const expectedRoot = {
      __key: ROOT_ID,
      group: {
        __ref: 'R3JvdXA6MDAwMDE='
      }
    };

    assert.deepEqual( ref, expectedRef, 'The normalize() method should return the correct root.' );

    assert.notEqual( typeof records[ROOT_ID], 'undefined', 'A root record should be entered.' );
    assert.deepEqual( records[ROOT_ID], expectedRoot, 'The root record should include the correct data.' )

    assert.end();
  });
});
