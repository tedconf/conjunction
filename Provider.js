import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Store from './store';

// TODO: Select a key less susceptible to collision and allow for override.
export const PROVIDER_KEY = 'data';

export const providerShape = PropTypes.shape({
  connect: PropTypes.func.isRequired,
  mutate: PropTypes.func.isRequired
}).isRequired;

export class Provider extends Component {
  static propTypes = {
    schema: PropTypes.object.isRequired
  };

  static defaultProps = {};

  static childContextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  constructor( props ) {
    super( props );

    this.store = Store( props.schema );
  }

  getChildContext() {
    return {
      [PROVIDER_KEY]: {
        connect: ( query, observer ) => {
          // FIXME: connect() will no longer pass directly through to the store. Need to implement fetch (query via schema), normalize, and put.
        },
        mutate: ( mutation ) => this.store.mutate( mutation )
      }
    };
  }

  render() {
    const { children } = this.props;

    return children ? React.Children.only( children ) : null;
  }
}

export default Provider;
