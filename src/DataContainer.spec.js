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
    assert.plan( 1 );

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
          render={ ({ error }) => {
            if ( error ) {
              assert.pass( 'The error was received.' );
              // Punting on the question of how the error is presented, given that multiple errors
              // could propagate during parrellel execution of a query graph.
            }

            return (
              <div></div>
            );
          }} />
      </Provider>
    );
  });
});
