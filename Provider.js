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
  ROOT_ID,
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

export class Provider extends Component<ProviderProps> {
  connect: ( any, any ) => Subscription;

  store: StoreInterface;

  static childContextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  constructor( props: ProviderProps ) {
    super( props );

    this.connect = this.connect.bind( this );

    this.store = Store();
  }

  getChildContext() {
    return {
      [PROVIDER_KEY]: {
        connect: this.connect,
        mutate: ( mutation ) => {
          // FIXME: mutate() also will no longer pass directly through to the store.
        }
      }
    };
  }

  render() {
    const { children } = this.props;

    return children ? React.Children.only( children ) : null;
  }

  connect ( query: any, observer: Observer ): Subscription {
    const { schema } = this.props;
    const store = this.store;

    return Observable
      .fromPromise( schema.query( query ).then( payload => {
        const { records } = normalize({ key: ROOT_ID }, payload );

        store.put( records );
      }))
      .concatMap( () => store.changes({ key: ROOT_ID, fragment: query }) )
      .subscribe( observer );
  }
}

export default Provider;
