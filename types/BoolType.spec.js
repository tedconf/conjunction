import test from 'tape';

import BoolType from './BoolType';

test( "connect/types/BoolType...", sub => {
  sub.test( "...should expose a .resolve() method that returns the source.", assert => {
    assert.equals( typeof BoolType.resolve, 'function', 'A .resolve() method should be exposed.' );

    const result = BoolType.resolve( true );

    assert.equals( typeof result.then, 'function', 'The .resolve() method shold return a promise.' );

    result.then(
      val => {
        assert.equals( val, true, 'The promise should resolve to the original source.' );
        assert.end();
      },
      err => assert.end( err )
    );
  });
});
