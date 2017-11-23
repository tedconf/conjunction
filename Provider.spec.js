import test, { mount } from 'util/tape-setup';
import React from 'react';

import {
  Schema,
  ObjectType,
  StringType
} from './Schema';

import {
  Provider
} from './Provider'

test( "connect/Provider...", sub => {
  sub.test( "....connect().", assert => {
    const Query = ObjectType({
      name: 'Query',
      fields: {
        name: {
          type: StringType,
          resolve: () => Promise.resolve( 'Jane Jetson' )
        }
      }
    });

    const schema = Schema({
      query: Query
    });

    const fragment = {
      __fields: {
        name: true
      }
    };

    const expectedData = {
      name: 'Jane Jetson'
    };

    const wrapper = mount( <Provider schema={ schema } /> );

    const connection = wrapper.instance().connect( fragment, {
      next: data => {
        assert.deepEqual( data, expectedData, 'The expected data should be loaded.' );
        assert.end();
      }
    });

    assert.equals( typeof connection.unsubscribe, 'function', 'The .connect() method should return a subscription.' );
  });
});
