export default function Store( schema ) {
  return {
    connect( query, receiver ) {
      console.log( 'Connected!', query );

      schema.query( query )
        .then( res => receiver( res ) );

      return {
        release() {
          console.log( 'Released!' );
        }
      };
    }
  };
}
