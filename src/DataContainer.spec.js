import test, { mount } from './__tape-setup';

import React from 'react';

import {
  Schema,
  ObjectType,
  StringType
} from './Schema';

import {
  Provider
} from './Provider';

import {
  DataContainer
} from './DataContainer';

test( "DataContainer...", sub => {
  sub.test( "...should throw an error if mounted without a provider.", assert => {
    assert.throws( () => mount(
      <DataContainer
        query={{}}
        render={ () => (
          <div></div>
        )} />
    ), /DataContainer mounted without a provider/i, );

    assert.end();
  });

  sub.test( "...should receive errors propogated from the query graph.", assert => {
    assert.plan( 3 );

    const Query = ObjectType({
      name: 'Query',
      fields: {
        token: {
          type: StringType,
          resolve: () => Promise.reject( new Error( 'Resolve error at _token_.' ) )
        }
      }
    });

    const schema = Schema({
      query: Query
    });

    const testQuery = {
      __fields: {
        token: true
      }
    };

    mount(
      <Provider schema={ schema }>
        <DataContainer
          query={ testQuery }
          render={ ({ errors }) => {
            if ( errors ) {
              assert.ok( Array.isArray( errors ), 'Any error(s) should be passed as an array.' );
              assert.equal( errors.length, 1, 'The number of errors encountered in the query graph should match the number received in the data container.' );
              assert.equal( errors[0].message, 'Resolve error at _token_.', 'The error message should match.' );
            }

            return (
              <div></div>
            );
          }} />
      </Provider>
    );
  });
});
