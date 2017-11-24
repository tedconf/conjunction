import test, { mount } from 'util/tape-setup';
import React, { Component } from 'react';

import { withMutations } from './withMutations';

import {
  PROVIDER_KEY,
  providerShape
} from './Provider';

test( "connect/withMutations...", sub => {
  sub.test( "...should expose mutate() as a property on the wrapped component.", assert => {
    class Spy extends Component {
      render() {
        return (
          <div></div>
        );
      }
    }

    class MockProvider extends Component {
      static childContextTypes = {
        [PROVIDER_KEY]: providerShape
      };

      getChildContext() {
        return {
          [PROVIDER_KEY]: {
            connect: val => val,
            mutate: mutation => Promise.resolve( mutation )
          }
        };
      }

      render() {
        const { children } = this.props;

        return children ? React.Children.only( children ) : null;
      }
    }

    assert.equal( typeof withMutations, 'function', 'The withMutations factory should be defined.' );

    const withTestMutations = withMutations({
      updateRecord: args => ({
        __args: args
      })
    });

    const Mock = withTestMutations( Spy );

    const wrapper = mount(
      <MockProvider>
        <Mock />
      </MockProvider>
    );

    assert.equal( wrapper.find( Spy ).length, 1, 'The wrapped component should be rendered.' );
    assert.equal( typeof wrapper.find( Spy ).prop( 'mutate' ), 'function', 'The wrapped component should receive mutate() as a property.' )

    const mutate = wrapper.find( Spy ).prop( 'mutate' );
    const req = mutate( 'updateRecord', { x: 'X000' });

    assert.equal( typeof req.then, 'function', 'The mutate() method should return a promise.' );

    const expectedRes = {
      __fields: {
        updateRecord: {
          __args: {
            x: 'X000'
          }
        }
      }
    };

    req.then(
      res => {
        assert.deepEqual( res, expectedRes, 'The provider should receive resolved mutation (args applied to mutation thunk).' );
        assert.end();
      },
      err => assert.end( err )
    );
  });
});
