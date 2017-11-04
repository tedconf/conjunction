import test from 'tape';

import IntType from './int';

test( "connect/types/int...", sub => {
  sub.test( "...should expose a .resolve() method that returns the source.", assert => {
    assert.equals( typeof IntType.resolve, 'function', 'A .resolve() method should be exposed.' );

    const result = IntType.resolve( 1011 );

    assert.equals( typeof result.then, 'function', 'The .resolve() method shold return a promise.' );

    result.then(
      val => {
        assert.equals( val, 1011, 'The promise should resolve to the original source.' );
        assert.end();
      },
      err => assert.end( err )
    );
  });
});
