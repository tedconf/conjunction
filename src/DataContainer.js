// @flow
import { Component } from 'react';
import { equals } from 'ramda';

import {
  PROVIDER_KEY,
  PROVIDER_SHAPE
} from './Provider';

import type { Element } from 'react';

type RenderProps = {};

type ComponentProps = {
  render?: ( RenderProps ) => Element<*>,
  children?: ( RenderProps ) => Element<*>,
  query: any,
  mutations: any
};

type ComponentState = {
  loaded: bool,
  data: any,
  error: any
};

export class DataContainer extends Component<ComponentProps, ComponentState> {
  props: ComponentProps;
  state: ComponentState;

  dispose: any;

  mutate: ( string, ...Array<any> ) => Promise<*>

  static contextTypes = {
    [PROVIDER_KEY]: PROVIDER_SHAPE
  };

  constructor( props: ComponentProps, context: any ) {
    super( props, context );

    if ( process.env.NODE_ENV !== 'production' && !context[PROVIDER_KEY] ) {
      throw new Error( 'DataContainer mounted without a provider.' );
    }

    this.mutate = this.mutate.bind( this );

    // TODO: Initialize with data when already available from provider.
    this.state = {
      loaded: false,
      data: undefined,
      error: null
    };
  }

  render() {
    const { loaded, data, error } = this.state;
    const { render, children } = this.props;

    // NOTE: Going to deprecate the 'loaded' property in favor of 'loading',
    // but for now will pass both. Also, going to pass the query result through
    // a 'data' object, rather than spreading it..., which will be a BREAKING
    // change.

    // NOTE: Migrating from props.render to props.children for the render property.
    // Will support both initially, and warn on use of props.render.
    // TODO: Remove support for support for props.render before first stable release.

    if ( render ) {
      console.warn( '[Conjunction] Deprecation warning: props.render has been deprecated in favor of props.children as a render property.' );
    }

    if ( children && typeof children !== 'function' ) throw new Error( 'Invalid render property (props.children) on DataContainer.' );

    const r = children || render;

    if ( typeof r !== 'function' ) throw new Error( 'DataContainer requires a render property.' );

    return r({
      loaded,
      loading: !loaded,
      data,
      error,
      mutate: this.mutate
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
    if ( this.dispose ) {
      // Dispose of prior subscriptions (e.g., on updated props).
      this.dispose();
    }
  }

  connect( query: any ) {
    const provider = this.context[PROVIDER_KEY];

    if ( this.dispose ) {
      // Dispose of prior subscriptions (e.g., on updated props).
      this.dispose();
    }

    if ( !query ) return;

    // Connect to the provider.
    this.dispose = provider.connect( query, {
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
        console.error( error ); // TODO: Including error here for visibility. Identify better method of surfacing errors if not handled (in render-prop) by user.

        this.setState({
          loaded: true,
          error
        })
      }
    });
  }

  mutate( key: string, ...params: Array<any> ): Promise<*> {
    const provider = this.context[PROVIDER_KEY];
    const { mutations } = this.props;

    if ( !mutations ) throw new Error( "You can't call mutate() without defining one or more mutations." );

    const { __updater, ...def } = mutations[key]( ...params );

    const mutation = {
      __fields: {
        [key]: {
          ...def
        }
      }
    };

    return provider.mutate( mutation, __updater ).then( res => res[key] );
  }
}
