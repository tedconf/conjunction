// @flow
import test from 'tape';

import {
  ObjectType,
  ArrayType,
  ScalarType
} from '../types';

test( "Traversal...", assert => {
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

  const records = {
    '__root': {
      __key: '__root',
      __type: 'Query',
      ship: { __ref: '0000C' }
    },
    '0000C': {
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
    },
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
    },
    '0000C:manifest:0': {
      __key: '0000C:manifest:0',
      __type: 'Cargo',
      item: 'Bantha Fodder',
      weight: 100.1
    },
    '0000C:manifest:1': {
      __key: '0000C:manifest:1',
      __type: 'Cargo',
      item: 'Kyber Crystals',
      weight: 24.6
    }
  };

  const expectedGraph = {
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

  const fragment = {
    __fields: {
      ship: {
        __fields: {
          id: true,
          name: true,
          crew: {
            __fields: {
              id: true,
              name: true
            }
          },
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

  const { graph } = Query.traverse({ ref: { __ref: '__root' }, fragment }, records );

  assert.deepEqual( graph, expectedGraph, 'The traversal should yield the expected graph.' );

  assert.end();
});
