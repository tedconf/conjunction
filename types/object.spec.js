import test from 'tape';

import ObjectType from './object';
import StringType from './string';

test( "connect/types/object...", sub => {
  sub.test( "...should expose fields via a .field() method.", assert => {
    const Sample = ObjectType({
      name: 'Sample',
      fields: {
        title: {
          type: StringType
        }
      }
    });

    assert.equals( typeof Sample.field, 'function', 'A .field() method should be exposed.' );

    const titleField = Sample.field( 'title' );

    assert.deepEquals( titleField, { type: StringType }, 'The field definition should be returned.' );
    assert.end();
  });

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
          assert.equals( err.message, 'Could not resolve a query including an undefined field.', 'The correct error should be returned.' );
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
});
