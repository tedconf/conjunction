import React, { Component } from 'react';
import { getDisplayName } from './util/hoc';

import {
  PROVIDER_KEY,
  providerShape
} from './Provider';

/**
 * The idea here is that not all fetched data needs to be cached and managed by
 * the store. **This might be a TERRIBLE idea.** Sure, the particular query looks
 * ephimeral when you're first developing code, but as the application evolves...
 *
 * Ultimately, this distinction shouldn't be necessary because effective garbage
 * collection would remove the unneeded data from the cache in due course.
 *
 * At the very least, when using this method we need to be cautious that if queried
 * data is then mixed with managed (cached) that it become managed at that time.
 */

export const withQueries = queries => WrappedComponent => {
  class Wrapper extends Component {
    static contextTypes = {
      [PROVIDER_KEY]: providerShape
    };

    render() {
      const provider = this.context[PROVIDER_KEY];

      return (
        <WrappedComponent { ...this.props } query={ ( key, ...params ) => {
            const fragment = queries[key]( ...params );

            return provider.query( fragment );
          }} />
      );
    }
  }

  Wrapper.displayName = `withMutations(${ getDisplayName( WrappedComponent ) })`;

  return Wrapper;
}
