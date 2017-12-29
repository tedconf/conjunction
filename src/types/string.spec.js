import test from 'tape';

import StringType from './string';

test( "connect/types/string...", sub => {
  sub.test( "...should expose a .resolve() method that returns the source.", assert => {
    assert.equals( typeof StringType.resolve, 'function', 'A .resolve() method should be exposed.' );

    const result = StringType.resolve( 'SOURCE' );

    assert.equals( typeof result.then, 'function', 'The .resolve() method shold return a promise.' );

    result.then(
      val => {
        assert.equals( val, 'SOURCE', 'The promise should resolve to the original source.' );
        assert.end();
      },
      err => assert.end( err )
    );
  });
});
