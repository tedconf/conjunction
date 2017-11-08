import test from 'tape';

import FloatType from './float';

test( "connect/types/float...", sub => {
  sub.test( "...should expose a .resolve() method that returns the source.", assert => {
    assert.equals( typeof FloatType.resolve, 'function', 'A .resolve() method should be exposed.' );

    const result = FloatType.resolve( 1011.01 );

    assert.equals( typeof result.then, 'function', 'The .resolve() method shold return a promise.' );

    result.then(
      val => {
        assert.equals( val, 1011.01, 'The promise should resolve to the original source.' );
        assert.end();
      },
      err => assert.end( err )
    );
  });
});
