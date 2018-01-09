// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Observable
} from './Rx/Observable';

import { Store } from './Store';
import type {
  StoreInterface,
  Subscription,
  Observer,
  Repository
} from './Store';

import {
  normalize
} from './Normalizer';

// TODO: Select a key less susceptible to collision and allow for override.
export const PROVIDER_KEY = 'data';

export const providerShape = PropTypes.shape({
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

  store: StoreInterface;

  static childContextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  constructor( props: ProviderProps ) {
    super( props );

    this.connect = this.connect.bind( this );
    this.mutate = this.mutate.bind( this );
    this.query = this.query.bind( this );

    this.store = Store();
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

  connect( query: any, observer: Observer ): Subscription {
    const { schema } = this.props;
    const store = this.store;

    return Observable
      .fromPromise( schema.query( query ).then( payload => {
        /**
         * Making the root key options (defaults to ROOT_ID), to allow introduction
         * of query-specific roots (to prevent collisions). Assigning a unique root
         * to each query solves the problem of collisions, while preserving the
         * core benefits of data consistency, because the unique roots map into
         * a shared graph based on node ids.
         */
        const { records, ref } = normalize( payload, { key: `__query${ counter() }` });

        store.put( records );

        return ref;
      }))
      .concatMap( ({ __ref }) => store.changes({ key: __ref, fragment: query }) )
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

  mutate( mutation: any, updater: ( Repository, any ) => Repository ): Promise<*> {
    const { schema } = this.props;
    const store = this.store;

    // TODO: Need to include the "fat" query on mutation definitions, so that fields don't have to be manually queried to ensure updates.

    return schema.mutate( mutation )
      .then( payload => {
        const { records } = normalize( payload, { key: '__query' });

        // Filter out the mutation root node(s).
        const update = Object.keys( records )
          .filter( key => !key.match( /^__query/ ) )
          .reduce( ( acc, key ) => ({
            ...acc,
            [key]: records[key]
          }), {});

        return store.put( update )
          .then( () => updater && store.update( records => updater( records, payload ) ) )
          .then( () => payload );
      });
  }

  query( query: any ) {
    const { schema } = this.props;

    return schema.query( query );
  }
}

export default Provider;
