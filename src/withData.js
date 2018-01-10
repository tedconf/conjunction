import React from 'react';

import { DataContainer } from './DataContainer';
import { getDisplayName } from './util/hoc';

export const withData = ( query ) => WrappedComponent => {
  const Wrapper = props => (
    <DataContainer
      query={ typeof query === 'function' ? query( props ) : query }
      render={ ( renderProps ) => (
        <WrappedComponent { ...renderProps } { ...props } />
      )} />
  );

  Wrapper.displayName = `withData(${ getDisplayName( WrappedComponent ) })`;

  return Wrapper;
}
