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
  data: any
};

export class DataContainer extends Component<ComponentProps, ComponentState> {
  props: ComponentProps;
  state: ComponentState;

  subscription: any;

  static contextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  constructor( props: ComponentProps ) {
    super( props );

    // TODO: Initialize with data when already available from provider.
    this.state = {
      loaded: false,
      data: {}
    };
  }

  render() {
    const { data, loaded } = this.state;
    const { render } = this.props;

    return render({
      ...data,
      loaded
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
      console.log( 'Reconnecting...', prevQuery, query );
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
      error: err => console.error( err )   // TODO: Handle error.
    });
  }
}
