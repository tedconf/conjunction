// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Store } from './Store';
import type {
  StoreInterface
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

type Disposable = {
  dispose: ( void ) => void
};

export class Provider extends Component<ProviderProps> {
  connect: ( any, any ) => Disposable;

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

  connect ( query: any, observer: any ): Disposable {
    const { schema } = this.props;
    const store = this.store;

    let disposed = false;

    schema.query( query )
      .then( payload => {
        !disposed && observer.next( payload );

        return {
          ...normalize({ key: ROOT_ID }, payload ),
          payload
        };
      })
      .then( ({ records, ref }) => {
        console.log( '[Provider.connect()]', { ref, records } );

        store.put( records );
        return store.get({ key: ROOT_ID, fragment: query })
      })
      .then( snapshot => {
        console.log( '[Provider.connect()]', { snapshot } );
      })
      .catch( err => console.error( err ) );

    return {
      dispose() {
        disposed = false;
      }
    };
  }
}

export default Provider;
