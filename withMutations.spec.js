import test, { mount } from 'util/tape-setup';
import React, { Component } from 'react';

import { withMutations } from './withMutations';

import {
  PROVIDER_KEY,
  providerShape
} from './provider';

test( "connect/withMutations...", sub => {
  sub.test( "...should expose a mutate method as a property on the wrapped component.", assert => {
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
            connect: val => val
          }
        };
      }

      render() {
        const { children } = this.props;

        return children ? React.Children.only( children ) : null;
      }
    }

    assert.equal( typeof withMutations, 'function', 'The withMutations factory should be defined.' );

    const Mock = withMutations()( Spy );

    const wrapper = mount(
      <MockProvider>
        <Mock />
      </MockProvider>
    );

    assert.equal( wrapper.find( Spy ).length, 1, 'The wrapped component should be rendered.' );
    assert.equal( typeof wrapper.find( Spy ).prop( 'mutate' ), 'function', 'The wrapped component should receive mutate() as a property.' )

    assert.end();
  });
});
