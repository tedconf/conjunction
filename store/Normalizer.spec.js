// @flow
import test from 'tape';

import {
  ROOT_ID,
  normalize
} from './Normalizer';

test( "connect/store/Normalizer.normalize()...", sub => {
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

  sub.test( "...traversal.", assert => {
    const data = {
      group: {
        id: 'R3JvdXA6MDAwMDE=',
        name: 'TEDxSebastopol',
        venue: {
          id: 'dmVudWVzOjAwMDAy',
          name: 'Ragle Ranch Park',
          address: {
            city: 'Sebastopol',
            state: 'California',
            postal_cide: '95472'
          }
        }
      }
    };

    const { records } = normalize( { key: ROOT_ID }, data );

    const expectedRecords = {
      [ROOT_ID]: {
        __key: ROOT_ID,
        group: {
          __ref: 'R3JvdXA6MDAwMDE='
        }
      },
      'R3JvdXA6MDAwMDE=': {
        __key: 'R3JvdXA6MDAwMDE=',
        id: 'R3JvdXA6MDAwMDE=',
        name: 'TEDxSebastopol',
        venue: {
          __ref: 'dmVudWVzOjAwMDAy'
        }
      },
      'dmVudWVzOjAwMDAy': {
        __key: 'dmVudWVzOjAwMDAy',
        id: 'dmVudWVzOjAwMDAy',
        name: 'Ragle Ranch Park',
        address: {
          __ref: 'dmVudWVzOjAwMDAy:address'
        }
      },
      'dmVudWVzOjAwMDAy:address': {
        __key: 'dmVudWVzOjAwMDAy:address',
        city: 'Sebastopol',
        state: 'California',
        postal_cide: '95472'
      }
    };

    assert.deepEqual( records, expectedRecords, 'The traversal should collect the expected records.' );
    assert.end();
  });

  sub.test( "...traversal with arrays.", assert => {
    const data = {
      group: {
        id: 'R3JvdXA6MDAwMDE=',
        name: 'TEDxSebastopol',
        venues: [
          {
            id: 'dmVudWVzOjAwMDAy',
            name: 'Ragle Ranch Park'
          },
          {
            id: 'dmVudWVzOjAwMDAz',
            name: 'Ives Park'
          }
        ]
      }
    };

    const { records } = normalize( { key: ROOT_ID }, data );

    const expectedRecords = {
      [ROOT_ID]: {
        __key: ROOT_ID,
        group: {
          __ref: 'R3JvdXA6MDAwMDE='
        }
      },
      'R3JvdXA6MDAwMDE=': {
        __key: 'R3JvdXA6MDAwMDE=',
        id: 'R3JvdXA6MDAwMDE=',
        name: 'TEDxSebastopol',
        venues: [
          { __ref: 'dmVudWVzOjAwMDAy' },
          { __ref: 'dmVudWVzOjAwMDAz' }
        ]
      },
      'dmVudWVzOjAwMDAy': {
        __key: 'dmVudWVzOjAwMDAy',
        id: 'dmVudWVzOjAwMDAy',
        name: 'Ragle Ranch Park'
      },
      'dmVudWVzOjAwMDAz': {
        __key: 'dmVudWVzOjAwMDAz',
        id: 'dmVudWVzOjAwMDAz',
        name: 'Ives Park'
      }
    };

    assert.deepEqual( records, expectedRecords, 'The traversal should collect the expected records.' );
    assert.end();
  });
});
