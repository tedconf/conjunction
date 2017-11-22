import React, { Component } from 'react';

import { getDisplayName } from 'util/hoc';

import {
  PROVIDER_KEY,
  providerShape
} from './provider';

export const withData = ( query ) => WrappedComponent => {
  class Wrapper extends Component {
    static propTypes = {};
    static defaultProps = {};

    static contextTypes = {
      [PROVIDER_KEY]: providerShape
    };

    constructor( props ) {
      super( props );

      // TODO: Initialize with data when already available from provider.
      this.state = {
        loaded: false,
        data: {}
      };
    }

    render() {
      const { data, loaded } = this.state;

      return (
        <WrappedComponent { ...data } loaded={ loaded } { ...this.props } />
      );
    }

    componentDidMount() {
      const provider = this.context[PROVIDER_KEY];

      // Connect to the provider.
      this.connection = provider.connect( typeof query === 'function' ? query( this.props ) : query, {
        next: res => this.setState( ({ data }) => ({
          loaded: true,
          data: {
            ...data,
            ...res
          }
        })),
        error: err => console.error( err )   // TODO: Handle error.
      });
    }

    componentWillUnmount() {
      // Release provider connection.
      this.connection.release(); // TODO: Change to .dispose().
    }
  }

  Wrapper.displayName = `withData(${ getDisplayName( WrappedComponent ) })`;

  return Wrapper;
}

export default withData;