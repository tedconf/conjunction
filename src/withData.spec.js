import test, { mount } from './__tape-setup';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  withData
} from './withData';

import {
  PROVIDER_KEY,
  providerShape
} from './Provider';

// TODO: Mocking is a code smell... https://medium.com/javascript-scene/mocking-is-a-code-smell-944a70c90a6a

export class MockProvider extends Component {
  static childContextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  static propTypes = {
    connect: PropTypes.func.isRequired
  };

  getChildContext() {
    const { connect } = this.props;

    return {
      [PROVIDER_KEY]: {
        connect
      }
    };
  }

  render() {
    const { children } = this.props;

    return children ? React.Children.only( children ) : null;
  }
}

test( "connect/connector/withData...", sub => {
  sub.test( "...should pass the wrapper's properties to the connected query (if a function/thunk).", assert => {
    const testQuery = ({ args }) => ({
      inside: args
    });

    const Component = withData( testQuery )( () => (
      <span>COMPONENT</span>
    ));

    mount(
      <MockProvider connect={ ( query ) => {
          assert.deepEquals( query, { inside: 'ARGS' })
          assert.end();
        }}>
        <Component args="ARGS" />
      </MockProvider>
    );
  });

  sub.test( "...should pass the wrapper's properties to the connected query (if static).", assert => {
    const testQuery = {
      args: 'ARGS2'
    };

    const Component = withData( testQuery )( () => (
      <span>COMPONENT</span>
    ));

    mount(
      <MockProvider connect={ ( query ) => {
          assert.deepEquals( query, { args: 'ARGS2' })
          assert.end();
        }}>
        <Component args="ARGS1" />
      </MockProvider>
    );
  });
});
