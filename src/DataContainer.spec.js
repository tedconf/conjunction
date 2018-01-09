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

  sub.test( "...should not receive an error if caught during propagation.", assert => {
    // The DataContainer should render twice: upon initialization and then with the result of the query execution.
    assert.plan( 5 );

    function AuthenticationError( message ) {
      this.message = message;
    }

    AuthenticationError.prototype = Object.create( Error.prototype );

    AuthenticationError.prototype.name = 'AuthenticationError';

    const events = [
      undefined,
      {
        token: '00000XX'
      }
    ];

    const Query = ObjectType({
      name: 'Query',
      fields: {
        token: {
          type: StringType,
          resolve: () => Promise.reject( new AuthenticationError( 'Resolve error at _token_.' ) )
        }
      }
    });

    const schema = Schema({
      query: Query,
      catch: error => {
        assert.pass( 'The catch should be called.' );

        if ( error.name === 'AuthenticationError' ) {
          return {
            token: '00000XX'
          };
        }
        else throw error;
      }
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
          render={ ({ data, error }) => {
            assert.error( error, 'There should be no error.' );
            assert.deepEquals( data, events.shift(), `Render should reflect the correct data.` );

            return (
              <div></div>
            );
          }} />
      </Provider>
    );
  });
});
