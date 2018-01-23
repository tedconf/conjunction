// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Observable
} from './Rx/Observable';

import { Store } from './Store';

import type {
  Subscription,
  Observer,
  Updater
} from './__flowtypes';

// TODO: Select a key less susceptible to collision and allow for override.
export const PROVIDER_KEY = 'data';

export const PROVIDER_SHAPE = PropTypes.shape({
  connect: PropTypes.func.isRequired,
  mutate: PropTypes.func.isRequired,
  query: PropTypes.func.isRequired
}).isRequired;

type ProviderProps = {
  schema: any,
  children: any
};

let __counter = 0;
const counter = () => ( __counter = __counter + 1 );

export class Provider extends Component<ProviderProps> {
  connect: ( any, any ) => Subscription;
  mutate: ( any ) => Promise<*>;
  query: ( any ) => Promise<*>;

  store: any;

  static childContextTypes = {
    [PROVIDER_KEY]: PROVIDER_SHAPE
  };

  constructor( props: ProviderProps ) {
    super( props );

    this.connect = this.connect.bind( this );
    this.mutate = this.mutate.bind( this );
    this.query = this.query.bind( this );

    this.store = Store( props.schema );
  }

  getChildContext() {
    return {
      [PROVIDER_KEY]: {
        connect: this.connect,
        mutate: this.mutate,
        query: this.query
      }
    };
  }

  render() {
    const { children } = this.props;

    return children ? React.Children.only( children ) : null;
  }

  connect( fragment: any, observer: Observer ): Subscription {
    const { schema } = this.props;
    const store = this.store;

    return Observable
      .fromPromise( schema.query( fragment ).then( graph => {
        // IDEA: Consider refactoring schema.query to return normalized data. I
        // don't think that graph data is ever used without passing through normalization
        // and the store. This could cut down on unnecessary traversal.

        // NOTE: Make the root key optional (defaults to ROOT_ID), to allow introduction
        // of query-specific roots (to prevent collisions). Assigning a unique root
        // to each query solves the problem of collisions, while preserving the
        // core benefits of data consistency, because the unique roots map into
        // a shared graph based on node ids.

        const { ref, records } = schema.normalize( graph, `__query${ counter() }` );

        store.update( () => records );

        return {
          ref,
          fragment
        };
      }))
      .concatMap( ( selector ) => store.changes( selector ) )
      .map( ({ graph }) => graph )
      .subscribe( observer );

      // An open question is: what qualifies as an "error" in the Observable sense,
      // and what happens after one is encountered (does the Observable remain in an
      // ongoing error state, or does it continue receiving updates)? This certainly
      // depends, at least in part, on the particulars of the query... at least as
      // to whether the error is recoverable.
      //
      // Leaning heavily toward unrecoverable errors bubbling out into the React
      // component tree, for handling via an error boundary (or other means).
      // Recoverable errors would then be "handled" within the schema definition,
      // and exposed (if at all) to the user by updates to the state graph.
  }

  mutate( mutation: any, updater: Updater ): Promise<*> {
    const { schema } = this.props;
    const store = this.store;

    // TODO: Need to include the "fat" query on mutation definitions, so that fields don't have to be manually queried to ensure updates.

    return schema.mutate( mutation ).then( ({ graph, records }) => {
      store.update( () => records );
      updater && store.update( records => updater( records, graph ) );

      return graph;
    });
  }

  query( query: any ) {
    const { schema } = this.props;

    return schema.query( query );
  }
}

export default Provider;
