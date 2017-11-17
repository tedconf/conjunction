// @flow
import test from 'tape';

import { Store } from './Store';

import type {
  Repository,
  Fragment
} from './Store';

test( "connect/store/Store...", sub => {
  sub.test( "...Store()", assert => {
    assert.equal( typeof Store, 'function', '...should be a factory function.' );

    const store = Store();
    assert.equal( typeof store, 'object', '...should return an object' );

    assert.end();
  });

  sub.test( "...Store#put()", assert => {
    const store = Store();
    assert.equal( typeof store.put, 'function', '...should be defined.' );

    assert.end();
  });

  sub.test( "...Store#get() should be defined.", assert => {
    const store = Store();
    assert.equal( typeof store.get, 'function', '...should be defined.' );

    assert.end();
  });

  sub.test( "...Store#get() should return the expected snapshot.", assert => {
    const records: Repository = {
      'R3JvdXA6MDAwMDE=': {
        __key: 'R3JvdXA6MDAwMDE=',
        __typename: 'Group',
        id: 'R3JvdXA6MDAwMDE=',
        name: 'TEDxSebastopol',
        venues: [
          { __ref: 'VmVudWU6MDAwMDI=' },
          { __ref: 'VmVudWU6MDAwMDM=' }
        ]
      },
      'VmVudWU6MDAwMDI=': {
        __key: 'VmVudWU6MDAwMDI=',
        __typename: 'Venue',
        name: 'Ragle Ranch Park'
      },
      'VmVudWU6MDAwMDM=': {
        __key: 'VmVudWU6MDAwMDM=',
        __typename: 'Venue',
        name: 'Ives Park'
      }
    };

    const fragment: Fragment = {
      __on: 'Group',
      __fields: {
        name: true,
        venues: {
          __fields: {
            name: true
          }
        }
      }
    };

    const expected = {
      data: {
        name: 'TEDxSebastopol',
        venues: [
          {
            name: 'Ragle Ranch Park'
          },
          {
            name: 'Ives Park'
          }
        ]
      },
      nodes: [
        'R3JvdXA6MDAwMDE=',
        'VmVudWU6MDAwMDI=',
        'VmVudWU6MDAwMDM='
      ].sort()
    };

    const store = Store();
    store.put( records );

    const snapshot = store.get({ fragment, key: 'R3JvdXA6MDAwMDE=' });

    assert.deepEqual( snapshot, expected, 'The selector should be correctly resolved.' );

    assert.end();
  });
});