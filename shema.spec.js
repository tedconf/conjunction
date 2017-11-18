import test from 'tape';

import {
  Schema,
  ObjectType,
  StringType
} from './schema';

test( "connect/schema...", sub => {
  sub.test( "...should define a Schema factory.", assert => {
    assert.equals( typeof Schema, 'function', 'Schema should be defined.' );
    assert.end();
  });

  sub.test( "...should expose a .query() method.", assert => {
    const User = ObjectType({
      name: 'User',
      fields: {
        name: {
          type: StringType
        }
      }
    });

    const Query = ObjectType({
      name: 'Query',
      fields: {
        user: {
          type: User,
          resolve: () => Promise.resolve({ name: 'Leroy Jetson' })
        }
      }
    });

    const schema = Schema({
      query: Query
    });

    assert.equals( typeof schema.query, 'function', 'The schema should expose a .query() method.' );

    const q = {
      user: {
        fields: {
          name: true
        }
      }
    };

    const expected = {
      user: {
        name: 'Leroy Jetson'
      }
    };

    const request = schema.query( q );

    assert.equal( typeof request.then, 'function', 'The .query() method should return a promise.' );

    request.then(
        res => {
          assert.deepEquals( res, expected, 'The query should return the expected data.' );
          assert.end();
        },
        err => assert.end( err )
      );
  });
});
