import test from 'tape';

// This suite tests normalization across all types.

import {
  ObjectType,
  ScalarType,
  ArrayType
} from '../types'

test( "Normalization", assert => {
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

  const data = {
    ship: {
      id: '0000C',
      name: 'Millennium Falcon',
      crew: [
        {
          id: 'crew_00A',
          name: 'Hans Solo'
        },
        {
          id: 'crew_00B',
          name: 'Chewbacca'
        }
      ],
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
  };

  const { ref, records } = Query.normalize( data, '__root' );

  assert.equal( typeof ref, 'object', 'The reference returned should be an object.' );
  assert.equal( ref.__ref, '__root', 'The root reference should point to the path provided.' );

  assert.equal( typeof records, 'object', 'The record collection returned should be an object.' );

  const expectedRootRecord = {
    __key: '__root',
    __type: 'Query',
    ship: { __ref: '0000C' }
  };

  assert.deepEqual( records['__root'], expectedRootRecord, 'A record should be included for the root node.' );

  const expectedShipRecord = {
    __key: '0000C',
    __type: 'Ship',
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
  };

  assert.deepEqual( records['0000C'], expectedShipRecord, 'A record should be included for the first child object (Ship).' );

  const expectedCrewRecords = {
    'crew_00A': {
      __key: 'crew_00A',
      __type: 'Person',
      id: 'crew_00A',
      name: 'Hans Solo'
    },
    'crew_00B': {
      __key: 'crew_00B',
      __type: 'Person',
      id: 'crew_00B',
      name: 'Chewbacca'
    }
  };

  Object.keys( expectedCrewRecords ).forEach( key => {
    assert.deepEqual( records[key], expectedCrewRecords[key], 'A record should be included for each child array (crew) member.' );
  });

  const expectedCargoRecords = [
    {
      __key: '0000C:manifest:0',
      __type: 'Cargo',
      item: 'Bantha Fodder',
      weight: 100.1
    },
    {
      __key: '0000C:manifest:1',
      __type: 'Cargo',
      item: 'Kyber Crystals',
      weight: 24.6
    }
  ];

  expectedCargoRecords.map( ( record ) => {
    assert.deepEqual( records[record.__key], record, 'A record should be included for each child array (cargo, no-ids)' );
  });

  assert.end();
});
