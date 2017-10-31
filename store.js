export default function Store( schema ) {
  return {
    connect( query, { next, error }) {
      console.log( 'Connected!', query );

      schema.query( query )
        .then(
          res => next( res ),
          err => error( err )
        );

      return {
        release() {
          console.log( 'Released!' );
        }
      };
    }
  };
}
