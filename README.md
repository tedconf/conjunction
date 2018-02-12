# conjunction

[![CircleCI](https://img.shields.io/circleci/project/tedconf/conjunction.svg)]() [![npm](https://img.shields.io/npm/v/@tedconf/conjunction.svg)]() [![npm](https://img.shields.io/npm/dt/@tedconf/conjunction.svg)]()

**Caution:** This library is currently in pre-release. The API is in flux and breaking changes may occur in any release on the 0.0.X branch.

# Conjunction

Mediates interaction with remote and local state (via an API in the case or remote) through a defined schema.

```js
import React from 'react';
import { DataContainer } from '@tedconf/conjunction';

const sessionQuery = {
  __fields: {
    user: {
      __args: {
        username: 'zebulonj'
      },
      __fields: {
        id: true,
        name: true,
        email: true
      }
    }
  }
};

export const App = () => (
  <DataContainer query={ sessionQuery }>
    { ({ loading, data: { user } }) => (
      <div>
        { loading && (
          <div>{ 'Loading...' }</div>
        )}
        { user && (
          <div>{ `Hello, ${ user.name }!` }</div>
        )}
      </div>
    )}
  </DataContainer>
);
```

```js
import {
  Schema,
  ObjectType,
  StringType
} from '@tedconf/conjunction';

import { request } from 'lib/request';

import { User } from './User';

export const Query = ObjectType({
  name: 'Query',
  fields: {
    user: {
      type: User,
      args: {
        username: StringType
      },
      resolve: ( root, args ) => request( `https://api.github.com/users/${ args.username }` )
        .then( ({ body }) => body )
    }
  }
});

export const schema = Schema({
  query: Query
});
```

See a full example at: https://github.com/zebulonj/conjunction-example

## Error Handling

Errors occurring anywhere in the graph (whether in association with a query or mutation) should
propagate up through the graph. Unhandled errors are passed through to the originating data container or
mutation.

```js
export const App = () => (
  <DataContainer query={ sessionQuery }>
    { ({ loading, data: { user }, error }) => (
      <div>
        { loading && (
          <div>{ 'Loading...' }</div>
        )}
        { loaded && user && (
          <div>{ `Hello, ${ user.name }!` }</div>
        )}
        { error && (
          <div className="error">
            { error.message }
          </div>
        )}
      </div>
    )}
  </DataContainer>
);
```
