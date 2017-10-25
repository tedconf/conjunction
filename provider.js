import React, { Component } from 'react';
import PropTypes from 'prop-types';

// TODO: Select a key less susceptible to collision and allow for override.
export const PROVIDER_KEY = 'data';

export const providerShape = PropTypes.shape({
  connect: PropTypes.func.isRequired
}).isRequired;

export class DataProvider extends Component {
  static propTypes = {};
  static defaultProps = {};

  static childContextTypes = {
    [PROVIDER_KEY]: providerShape
  };

  getChildContext() {
    return {
      [PROVIDER_KEY]: {
        connect( query, receiver ) {
          console.log( 'Connected!' );

          return {
            release() {
              console.log( 'Released!' );
            }
          };
        }
      }
    };
  }

  render() {
    const { children } = this.props;

    return children ? React.Children.only( children ) : null;
  }
}

export default DataProvider;
