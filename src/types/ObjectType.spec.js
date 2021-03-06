import test from 'tape';

import { ObjectType } from './ObjectType';
import { InputObjectType } from './InputObjectType';
import {
  StringType,
  IntType
} from './ScalarType';

test( "connect/types/ObjectType...", sub => {
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
      __fields: {
        title: true,
        collector: true
      }
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
      __fields: {
        nodef: true
      }
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
      __fields: {
        name: true,
        birthdate: true
      }
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

  sub.test( "...should apply custom field resolvers.", assert => {
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
          resolve: () => Promise.resolve( fakeUser )
        }
      }
    });

    const query = {
      __fields: {
        user: {
          __fields: {
            name: true,
            birthdate: true
          }
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
          assert.deepEquals( res, expected, 'The nested query should be correctly resolved based on the custom resolver.' );
          assert.end();
        },
        err => assert.end( err )
      );
  });

  sub.test( "...should pass field arguments from the query to the field resolver.", assert => {
    // https://en.wikipedia.org/wiki/List_of_battleships_of_the_United_States_Navy
    const registry = {
      1011: {
        id: 1011,
        name: 'USS Delaware',
        commissioned: '1910-04-04'
      }
    };

    const params = {
      __fields: {
        ship: {
          __args: {
            id: 1011
          },
          __fields: {
            name: true,
            commissioned: true
          }
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
          resolve: ( _, { id }) => {
            assert.equals( id, 1011, 'The argument should be passed to the resolver.' );

            return Promise.resolve( registry[id] );
          }
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

  sub.test( "...should resolve query/mutation arguments before passing to the field resolver.", assert => {
    const Person = ObjectType({
      name: 'Person',
      fields: {
        name: {
          type: StringType
        },
        age: {
          type: IntType
        }
      }
    });

    const PersonInput = InputObjectType({
      name: 'PersonInput',
      fields: {
        name: {
          type: StringType,
          resolve: root => `${ root.first_name } ${ root.last_name }`
        },
        age: {
          type: StringType
        }
      }
    });

    const Registration = ObjectType({
      name: 'Registration',
      fields: {
        attendee: {
          type: Person
        }
      }
    });

    const MutationType = ObjectType({
      name: 'MutationType',
      fields: {
        addRegistration: {
          args: {
            attendee: PersonInput
          },
          type: Registration,
          resolve: ( _, { attendee }) => Promise.resolve({ attendee })
        }
      }
    });

    const mutation = {
      __fields: {
        addRegistration: {
          __args: {
            attendee: {
              first_name: 'George',
              last_name: 'Jetson',
              age: 122
            }
          },
          __fields: {
            attendee: {
              __fields: {
                name: true,
                age: true
              }
            }
          }
        }
      }
    };

    const req = MutationType.resolve( undefined, mutation );

    const expected = {
      addRegistration: {
        attendee: {
          name: 'George Jetson',
          age: 122
        }
      }
    };

    req.then(
      res => {
        assert.deepEquals( res, expected, 'The attendee data should be transformed via the InputType.' );
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
      __fields: {
        a: true
      }
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

  sub.test( "...should reject the returned promise if a nested resolver rejects.", assert => {
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
          resolve: () => Promise.reject({
            message: 'Session could not be loaded.'
          })
        }
      }
    });

    const fragment = {
      __fields: {
        session: {
          __fields: {
            live: true
          }
        }
      }
    };

    const request = QueryRoot.resolve( undefined, fragment );

    assert.equals( typeof request.then, 'function', 'Should return a promise.' );

    request.then(
      () => assert.fail( 'The request should not resolve.' ),
      err => {
        assert.deepEquals( err, { message: 'Session could not be loaded.' }, 'The error should be passed through.' );
        assert.end();
      }
    );
  });

  sub.test( "...should handle thunks (fields) in the resolver.", assert => {
    const Person = ObjectType({
      name: 'Person',
      fields: () => ({
        id: {
          type: StringType,
          resolve: () => 'P01'
        },
        name: {
          type: StringType,
          resolve: () => 'Judy Jetson'
        }
      })
    });

    Person.resolve({}, { __fields: { id: true, name: true } })
      .then(
        person => {
          assert.deepEqual( person, { id: 'P01', name: 'Judy Jetson' }, 'The node should be resolved.' );
          assert.end();
        },
        err => assert.fail( err )
      );
  });

  sub.test( "...should handle thunks (fields) in the normalizer.", assert => {
    const Person = ObjectType({
      name: 'Person',
      fields: () => ({
        id: {
          type: StringType,
          resolve: () => 'P01'
        },
        name: {
          type: StringType,
          resolve: () => 'Judy Jetson'
        }
      })
    });

    try {
      const actual = Person.normalize({ id: 'P01', name: 'Judy Jetson' });

      const expected = {
        ref: { __ref: 'P01' },
        records: {
          'P01': {
            __key: 'P01',
            __type: 'Person',
            id: 'P01',
            name: 'Judy Jetson'
          }
        }
      };

      assert.deepEqual( actual, expected, 'The input should be normalized without error.' );
      assert.end();
    }
    catch ( err ) {
      assert.end( err );
    }
  });
});
