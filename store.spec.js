import test from 'tape';

import {
  Schema,
  ObjectType,
  StringType
} from './schema';

import Store from './store';

test( "connect/store#query...", sub => {
  sub.test( "...should pass through rejections from the schema.", assert => {
    const User = ObjectType({
      name: 'User',
      fields: {
        name: {
          type: StringType
        }
      }
    });

    const QueryRoot = ObjectType({
      name: 'QueryRoot',
      fields: {
        user: {
          type: User,
          resolve: () => Promise.reject({ message: 'Failure!' })
        }
      }
    });

    const schema = Schema({
      query: QueryRoot
    });

    const query = {
      user: {
        __fields: {
          name: true
        }
      }
    };

    const store = Store( schema );

    store.connect( query, {
      next: () => assert.fail( 'The query should not resolve.' ),
      error: err => {
        assert.deepEquals( err, { message: 'Failure!' }, 'The rejection should pass through without modification.' );
        assert.end();
      }
    });
  });
});
