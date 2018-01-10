import React, { Component } from 'react';
import { getDisplayName } from './util/hoc';

import {
  PROVIDER_KEY,
  PROVIDER_SHAPE
} from './Provider';

/**
 * State:
 *  - pending
 *  - errors
 *  - complete
 *
 * Actions:
 *  - mutate( String: mutation, Object: args ) : Promise
 *  - clear/reset
 */

export const withMutations = mutations => WrappedComponent => {
  class Wrapper extends Component {
    static contextTypes = {
      [PROVIDER_KEY]: PROVIDER_SHAPE
    };

    render() {
      const provider = this.context[PROVIDER_KEY];

      return (
        <WrappedComponent { ...this.props } mutate={ ( key, ...params ) => {
            const { __updater, ...def } = mutations[key]( ...params );

            const mutation = {
              __fields: {
                [key]: {
                  ...def
                }
              }
            };

            return provider.mutate( mutation, __updater ).then( res => res[key] );
          }} />
      );
    }
  }

  Wrapper.displayName = `withMutations(${ getDisplayName( WrappedComponent ) })`;

  return Wrapper;
}
