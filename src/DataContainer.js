// @flow
import { Component } from 'react';
import equals from 'ramda/src/equals';

import {
  PROVIDER_KEY,
  providerShape
} from './Provider';

import type { Element } from 'react';

type RenderProps = {};

type ComponentProps = {
  render: ( RenderProps ) => Element<*>,
  query: any
};

type ComponentState = {
  loaded: bool,
  data: any,
  error: any
};

export class DataContainer extends Component<ComponentProps, ComponentState> {
  props: ComponentProps;
  state: ComponentState;

  subscription: any;

  static contextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  constructor( props: ComponentProps, context: any ) {
    super( props, context );

    if ( !context[PROVIDER_KEY] ) {
      throw new Error( 'DataContainer mounted without a provider.' );
    }

    // TODO: Initialize with data when already available from provider.
    this.state = {
      loaded: false,
      data: {},
      error: null
    };
  }

  render() {
    const { loaded, data, error } = this.state;
    const { render } = this.props;

    // NOTE: Going to deprecate the 'loaded' property in favor of 'loading',
    // but for now will pass both. Also, going to pass the query result through
    // a 'data' object, rather than spreading it..., which will be a BREAKING
    // change.

    return render({
      ...data,
      error,
      loaded,
      loading: !loaded
    });
  }

  componentDidMount() {
    const { query } = this.props;

    this.connect( query );
  }

  componentWillReceiveProps({ query }: ComponentProps ) {
    const { query: prevQuery } = this.props;

    // Test that queries are equivalent, only triggers reconnection when props change queries.
    if ( !equals( prevQuery, query ) ) {
      if ( process.env.NODE_ENV !== 'production' ) {
        console.log( 'Reconnecting...', prevQuery, query );
      }

      this.connect( query );
    }
  }

  componentWillUnmount() {
    // Release provider subscription.
    this.subscription.unsubscribe();
  }

  connect( query: any ) {
    const provider = this.context[PROVIDER_KEY];

    if ( this.subscription ) {
      // Dispose of prior subscriptions (e.g., on updated props).
      this.subscription.unsubscribe();
    }

    // Connect to the provider.
    this.subscription = provider.connect( query, {
      next: data => {
        if ( process.env.NODE_ENV !== 'production' ) {
          console.log( `[DataContainer]`, data );
        }

        this.setState({
          loaded: true,
          data
        });
      },
      // Decided to capture the error in the container state and pass it out via
      // the render prop, rather than throw it into the React component tree. This
      // adds flexibility for how errors can be handled. For cases where users want
      // to handle the error via an error boundary, their render prop can simply
      // throw the error when it is encountered.
      error: error => {
        this.setState({
          error
        })
      }
    });
  }
}
