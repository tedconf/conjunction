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
  Observer
} from './Store';

import {
  normalize
} from './Normalizer';

// TODO: Select a key less susceptible to collision and allow for override.
export const PROVIDER_KEY = 'data';

export const providerShape = PropTypes.shape({
  connect: PropTypes.func.isRequired,
  mutate: PropTypes.func.isRequired
}).isRequired;

type ProviderProps = {
  schema: any,
  children: any
};

let __counter = 0;
const counter = () => ( __counter = __counter + 1 );

export class Provider extends Component<ProviderProps> {
  connect: ( any, any ) => Subscription;
  mutate: ( any ) => Promise<*>

  store: StoreInterface;

  static childContextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  constructor( props: ProviderProps ) {
    super( props );

    this.connect = this.connect.bind( this );
    this.mutate = this.mutate.bind( this );

    this.store = Store();
  }

  getChildContext() {
    return {
      [PROVIDER_KEY]: {
        connect: this.connect,
        mutate: this.mutate
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
        console.log( '[connect] Query:', query, payload );

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
  }

  mutate( mutation: any ): Promise<*> {
    const { schema } = this.props;
    const store = this.store;

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

        store.put( update );

        return payload;
      });
  }
}

export default Provider;
