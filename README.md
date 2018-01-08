[![CircleCI](https://circleci.com/gh/tedconf/conjunction.svg?style=svg)](https://circleci.com/gh/tedconf/conjunction)

# Conjunction

```jsx
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
  <DataContainer
    query={ sessionQuery }
    render={ ({ loaded, user }) => (
      <div>
        { !loaded && (
          <div>{ 'Loading...' }</div>
        )}
        { loaded && user && (
          <div>{ `Hello, ${ user.name }!` }</div>
        )}
      </div>
    )} />
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
