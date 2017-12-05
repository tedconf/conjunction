import React, { Component } from 'react';
import equals from 'ramda/src/equals';

import { getDisplayName } from 'util/hoc';

import {
  PROVIDER_KEY,
  providerShape
} from './Provider';

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
      this.connect( this.props );
    }

    componentWillReceiveProps( nextProps ) {
      if ( !equals( this.props, nextProps ) ) {
        console.log( 'Reconnecting...', this.props, nextProps );
        this.connect( nextProps );
      }
    }

    componentWillUnmount() {
      // Release provider subscription.
      this.subscription.unsubscribe();
    }

    connect( props ) {
      const provider = this.context[PROVIDER_KEY];

      if ( this.subscription ) {
        // Dispose of prior subscriptions (e.g., on updated props).
        this.subscription.unsubscribe();
      }

      // Connect to the provider.
      this.subscription = provider.connect( typeof query === 'function' ? query( props ) : query, {
        next: data => {
          if ( process.env.NODE_ENV !== 'production' ) {
            console.log( `[${ Wrapper.displayName }]`, data );
          }

          this.setState({
            loaded: true,
            data
          });
        },
        error: err => console.error( err )   // TODO: Handle error.
      });
    }
  }

  Wrapper.displayName = `withData(${ getDisplayName( WrappedComponent ) })`;

  return Wrapper;
}

export default withData;
