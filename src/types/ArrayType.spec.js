import test from 'tape';

import { ObjectType } from './ObjectType';
import { ArrayType } from './ArrayType';
import { StringType } from './ScalarType';

test( "connect/types/array...", sub => {
  sub.test( "...should map source items to the wrapped type's resolve method.", assert => {
    const Book = ObjectType({
      name: 'Book',
      fields: {
        title: {
          type: StringType
        }
      }
    });

    const QueryRoot = ObjectType({
      name: 'QueryRoot',
      fields: {
        books: {
          type: ArrayType( Book ),
          resolve: () => Promise.resolve([
            {
              title: 'JavaScript: The Good Parts'
            },
            {
              title: 'JavaScript: The Definitive Guide'
            }
          ])
        }
      }
    });

    const query = {
      __fields: {
        books: {
          __fields: {
            title: true
          }
        }
      }
    };

    const request = QueryRoot.resolve( undefined, query );

    const expected = {
      books: [
        {
          title: 'JavaScript: The Good Parts'
        },
        {
          title: 'JavaScript: The Definitive Guide'
        }
      ]
    };

    assert.equals( typeof request.then, 'function', 'Should return a promise.' );

    request.then(
      res => {
        assert.deepEquals( res, expected, 'The request should yield the expected data.' );
        assert.end();
      },
      err => assert.end( err )
    );
  });
});
