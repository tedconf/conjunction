import test from 'tape';

import ObjectType from './object';
import StringType from './string';
import IntType from './int';

test( "connect/types/object...", sub => {
  sub.test( "...should expose a .resolve() method.", assert => {
    const Sample = ObjectType({
      name: 'Sample'
    });

    assert.equals( typeof Sample.resolve, 'function', 'A .resolve() method should be exposed.' );
    assert.end();
  });

  sub.test( "...should resolve canonical fields.", assert => {
    // ...should be resolved by (default) sourcing each field, then calling the field-type's .resolve() method
    const Sample = ObjectType({
      name: 'Sample',
      fields: {
        title: {
          type: StringType
        },
        collector: {
          type: StringType
        }
      }
    });

    const source = {
      title: 'Particulate Matter',
      collector: 'Some Technician'
    };

    const query = {
      title: true,
      collector: true
    };

    const request = Sample.resolve( source, query );

    assert.equals( typeof request.then, 'function', 'The .resolve() method should return a promise.' );

    request.then(
        res => {
          assert.deepEquals( res, { ...source }, 'The fields should be correctly resolved from source data.' );
          assert.end();
        },
        err => assert.end( err )
      );
  });

  sub.test( "...should throw an error from .resolve() if an undefined field is queried.", assert => {
    const Sample = ObjectType({
      name: 'Sample',
      fields: {

      }
    });

    const query = {
      nodef: true
    };

    Sample.resolve( undefined, query )
      .then(
        () => assert.fail( 'The request should not resolve.' ),
        err => {
          assert.ok( err.message.match( /^Could not resolve a query including an undefined field\./ ), 'The correct error should be returned.' );
          assert.end();
        }
      );
  });

  sub.test( "...should only resolve queried fields.", assert => {
    const Person = ObjectType({
      name: 'Person',
      fields: {
        name: {
          type: StringType
        },
        age: {
          type: StringType
        },
        birthdate: {
          type: StringType
        }
      }
    });

    const source = {
      name: 'George Jetson',
      age: 46,
      birthdate: '2108-11-16'
    };

    const query = {
      name: true,
      birthdate: true
    };

    Person.resolve( source, query )
      .then(
        res => {
          assert.deepEquals( res, { name: 'George Jetson', birthdate: '2108-11-16' }, 'Fields should be picked based on the query.' );
          assert.end();
        },
        err => assert.end( err )
      );
  });

  sub.test( "...should resolve custom field sources.", assert => {
    const fakeUser = {
      name: 'Judy Jetson',
      birthdate: '2130-03-20',
      height: 5.5
    };

    const User = ObjectType({
      name: 'User',
      fields: {
        name: {
          type: StringType
        },
        birthdate: {
          type: StringType
        },
        height: {
          type: StringType
        }
      }
    });

    const QueryRoot = ObjectType({
      name: 'Query',
      fields: {
        user: {
          type: User,
          source: () => Promise.resolve( fakeUser )
        }
      }
    });

    const query = {
      user: {
        fields: {
          name: true,
          birthdate: true
        }
      }
    };

    const expected = {
      user: {
        name: 'Judy Jetson',
        birthdate: '2130-03-20'
      }
    };

    QueryRoot.resolve( undefined, query )
      .then(
        res => {
          assert.deepEquals( res, expected, 'The nested query should be correctly resolved based on the custom source.' );
          assert.end();
        },
        err => assert.end( err )
      );
  });

  sub.test( "...should pass field arguments from the query to the field source.", assert => {
    // https://en.wikipedia.org/wiki/List_of_battleships_of_the_United_States_Navy
    const registry = {
      1011: {
        id: 1011,
        name: 'USS Delaware',
        commissioned: '1910-04-04'
      }
    };

    const params = {
      ship: {
        args: {
          id: 1011
        },
        fields: {
          name: true,
          commissioned: true
        }
      }
    };

    const Ship = ObjectType({
      name: 'Ship',
      fields: {
        id: {
          type: IntType
        },
        name: {
          type: StringType
        },
        commissioned: {
          type: StringType
        }
      }
    });

    const Query = ObjectType({
      name: 'Query',
      fields: {
        ship: {
          type: Ship,
          args: {
            id: IntType
          },
          source: ( _, { id }) => Promise.resolve( registry[id] )
        }
      }
    });

    const expected = {
      ship: {
        name: 'USS Delaware',
        commissioned: '1910-04-04'
      }
    };

    const req = Query.resolve( undefined, params );

    req.then(
      res => {
        assert.deepEquals( res, expected, 'The expected data should be returned.' );
        assert.end();
      },
      err => assert.end( err )
    );
  });

  sub.test( "...should resolve to null if the source is null.", assert => {
    const Sample = ObjectType({
      name: 'Sample',
      fields: {
        a: {
          type: StringType
        }
      }
    });

    const query = {
      a: true
    };

    Sample.resolve( null, query )
      .then(
        res => {
          assert.equals( res, null, 'The schema should resolve to null.' );
          assert.end();
        },
        err => assert.end( err )
      );
  });

  sub.test( "...should reject the returned promise if a nested source rejects.", assert => {
    const Session = ObjectType({
      name: 'Session',
      fields: {
        live: {
          type: StringType
        }
      }
    });

    const QueryRoot = ObjectType({
      name: 'QueryRoot',
      fields: {
        session: {
          type: Session,
          source: () => Promise.reject({
            message: 'Session could not be loaded.'
          })
        }
      }
    });

    const request = QueryRoot.resolve( undefined, { session: { fields: { live: true } } } );

    assert.equals( typeof request.then, 'function', 'Should return a promise.' );

    request.then(
      () => assert.fail( 'The request should not resolve.' ),
      err => {
        assert.deepEquals( err, { message: 'Session could not be loaded.' }, 'The error should be passed through.' );
        assert.end();
      }
    );
  });
});
