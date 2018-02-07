import test, { mount } from './__tape-setup';
import React from 'react';

import {
  Schema,
  ObjectType,
  StringType
} from './Schema';

import {
  Provider
} from './Provider'

import pipe from 'callbag-pipe';
import makeBehaviorSubject from 'callbag-behavior-subject';
import subscribe from 'callbag-subscribe';

test( "Callbag sanity check.", assert => {
  const subject = makeBehaviorSubject( '0' );
  const events = [];

  const dispose = pipe(
    subject,
    subscribe({
      next: val => events.push( val ),
      error: err => events.push({ err })
    })
  );

  assert.equal( typeof dispose, 'function', 'The subscribe() method should return a function.' );

  subject( 1, 'A' );
  subject( 1, 'B' );

  dispose();

  subject( 2, 'Yikes!' )

  assert.deepEqual( events, ['0', 'A', 'B'], 'All events should be received.' );
  assert.end();
});

test( "Provider...", sub => {
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

    const unsubscribe = wrapper.instance().connect( fragment, {
      next: data => {
        assert.deepEqual( data, expectedData, 'The expected data should be loaded.' );
        assert.end();
      }
    });

    assert.equals( typeof unsubscribe, 'function', 'The .connect() method should return a disposal function.' );
  });

  sub.test( "...mutate().", assert => {
    const initialOwner = {
      id: 'UGVyc29uOjAwMDAx',
      name: 'Judy Jetson'
    };

    const Person = ObjectType({
      name: 'Person',
      fields: {
        id: {
          type: StringType
        },
        name: {
          type: StringType
        }
      }
    });

    const Query = ObjectType({
      name: 'Query',
      fields: {
        owner: {
          type: Person,
          resolve: () => Promise.resolve( initialOwner )
        }
      }
    });

    const Mutation = ObjectType({
      name: 'Mutation',
      fields: {
        updatePerson: {
          type: Person,
          args: {
            id: StringType,
            name: StringType
          },
          resolve: ( _, { id, name }) => Promise.resolve({ id, name })
        }
      }
    });

    const schema = Schema({
      query: Query,
      mutation: Mutation
    });

    const fragment = {
      __fields: {
        owner: {
          __fields: {
            id: true,
            name: true
          }
        }
      }
    };

    const wrapper = mount( <Provider schema={ schema } /> );

    const updates = [];

    const expectedUpdates = [{
      owner: {
        id: 'UGVyc29uOjAwMDAx',
        name: 'Judy Jetson'
      }
    }, {
      owner: {
        id: 'UGVyc29uOjAwMDAx',
        name: 'Judy B. Jetson'
      }
    }];

    const provider = wrapper.instance();

    provider.connect( fragment, {
      next: data => {
        updates.push( data );

        const updateIndex = updates.length - 1;

        assert.ok( updateIndex < expectedUpdates.length, 'The connection should not push more updates than expected.' );
        assert.deepEqual( updates[updateIndex], expectedUpdates[updateIndex], `Update ${ updateIndex } should contain the expected data.` );

        //if ( updateIndex == ( expectedUpdates.length - 1 ) ) assert.end();
      }
    });

    const mutation = {
      __fields: {
        updatePerson: {
          __args: {
            id: 'UGVyc29uOjAwMDAx',
            name: 'Judy B. Jetson'
          },
          __fields: {
            id: true,
            name: true
          }
        }
      }
    };

    provider.mutate( mutation );

    assert.plan( 2 * expectedUpdates.length );
  });
});
