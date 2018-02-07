// @flow
import test from 'tape';

import pipe from 'callbag-pipe';
import subscribe from 'callbag-subscribe';

import { Store } from './Store';
import { Schema } from './Schema';
import {
  ObjectType,
  ArrayType,
  ScalarType
} from './types';

import type {
  RecordMap
} from './__flowtypes';

test( "connect/store/Store...", sub => {
  sub.test( "...Store()", assert => {
    assert.equal( typeof Store, 'function', '...should be a factory function.' );

    const store = Store();
    assert.equal( typeof store, 'object', '...should return an object' );

    assert.end();
  });

  sub.test( "...Store#update()", assert => {
    const store = Store();
    assert.equal( typeof store.update, 'function', '...should be defined.' );

    assert.end();
  });

  sub.test( "...Store#update() should merge updated records.", assert => {
    const Person = ObjectType({
      name: 'Person',
      fields: {
        id: {
          type: ScalarType
        },
        name: {
          type: ScalarType
        }
      }
    });

    const Cargo = ObjectType({
      name: 'Cargo',
      fields: {
        item: {
          type: ScalarType
        },
        weight: {
          type: ScalarType
        }
      }
    });

    const Ship = ObjectType({
      name: 'Ship',
      fields: {
        id: {
          type: ScalarType
        },
        name: {
          type: ScalarType
        },
        crew: {
          type: ArrayType( Person )
        },
        manifest: {
          type: ArrayType( Cargo )
        }
      }
    });

    const Query = ObjectType({
      name: 'Query',
      fields: {
        ship: {
          type: Ship
        }
      }
    });

    const schema = Schema({
      query: Query
    })

    const records: RecordMap = {
      '__root': {
        __key: '__root',
        __typename: 'Query',
        ship: { __ref: '0000C' }
      },
      '0000C': {
        __key: '0000C',
        __typename: 'Ship',
        id: '0000C',
        name: 'Millennium Falcon',
        crew: [
          { __ref: 'crew_00A' },
          { __ref: 'crew_00B' }
        ],
        manifest: [
          { __ref: '0000C:manifest:0' },
          { __ref: '0000C:manifest:1' }
        ]
      },
      'crew_00A': {
        __key: 'crew_00A',
        __typename: 'Person',
        id: 'crew_00A',
        name: 'Hans Solo'
      },
      'crew_00B': {
        __key: 'crew_00B',
        __typename: 'Person',
        id: 'crew_00B',
        name: 'Chewbacca'
      },
      '0000C:manifest:0': {
        __key: '0000C:manifest:0',
        __typename: 'Cargo',
        item: 'Bantha Fodder',
        weight: 100.1
      },
      '0000C:manifest:1': {
        __key: '0000C:manifest:1',
        __typename: 'Cargo',
        item: 'Kyber Crystals',
        weight: 24.6
      }
    };

    const fragment = {
      __fields: {
        ship: {
          __fields: {
            manifest: {
              __fields: {
                item: true,
                weight: true
              }
            }
          }
        }
      }
    };

    const store = Store( schema );
    store.update( () => records );

    const events = [];

    const expectedEvents = [
      {
        ship: {
          manifest: [
            {
              item: 'Bantha Fodder',
              weight: 100.1
            },
            {
              item: 'Kyber Crystals',
              weight: 24.6
            }
          ]
        }
      },
      {
        ship: {
          manifest: [
            {
              item: 'Bantha Fodder',
              weight: 150.5
            },
            {
              item: 'Kyber Crystals',
              weight: 24.6
            }
          ]
        }
      }
    ];

    pipe(
      store.changes({ ref: { __ref: '__root' }, fragment }),
      subscribe({
        next: ({ graph }) => events.push( graph ),
        error: err => assert.error( err )
      })
    );

    store.update( () => ({
      '0000C:manifest:0': {
        __key: '0000C:manifest:0',
        __typename: 'Cargo',
        weight: 150.5
      }
    }));

    assert.deepEqual( events, expectedEvents, 'The expected graphs should be emitted on update.' );
    assert.end();
  });
});
