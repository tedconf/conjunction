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
    },

    mutate( mutation ) {
      console.log( 'Mutate:', mutation );

      return schema.mutate( mutation );
    }
  };
}
