import React, { Component } from 'react';
import { getDisplayName } from 'util/hoc';

import {
  PROVIDER_KEY,
  providerShape
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
      [PROVIDER_KEY]: providerShape
    };

    render() {
      const provider = this.context[PROVIDER_KEY];

      return (
        <WrappedComponent { ...this.props } mutate={ ( key, params ) => provider.mutate({
            __fields: {
              [key]: mutations[key]( params )
            }
          }) } />
      );
    }
  }

  Wrapper.displayName = `withMutations(${ getDisplayName( WrappedComponent ) })`;

  return Wrapper;
}
