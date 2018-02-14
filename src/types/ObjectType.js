// @flow
import { mergeDeepLeft } from 'ramda';
import { mapObject, reduceObject } from '../util/object';

const defaultFieldResolver = ( parent, fieldName ) => {
  const field = parent[fieldName];

  return field && ( typeof field === 'function' ) ? field.call( parent ) : field;
}

export const resolveArgs = ( args = {}, argDefs = {} ): Promise<*> => {
  const resolvers = Object.keys( args ).map( key => {
    return Promise.resolve( argDefs[key].resolve( args[key] ) )
      .then( value => ([
        key,
        value
      ]))
  });

  return Promise.all( resolvers )
    .then( results => results.reduce( ( acc, [key, value]) => ({
      ...acc,
      [key]: value
    }), {}));
};

import type {
  FieldDefinitions,
  NormalizedResponse,
  Selector,
  RecordMap,
  Snapshot
} from '../__flowtypes';

type ConstructorParams = {
  name: string,
  fields: FieldDefinitions
};

export function ObjectType({ name, fields = {} }: ConstructorParams = {}) {
  return {
    /**
     * Resolves a graph, rooted in the defined object type, corresponding to a
     * passed query fragment. Uses defined resolvers on each field, falling back
     * to a default field resolver here (which plucks the value corresponding to
     * the same-named property on `source`, if available).
     */
    resolve( source, query, context = {} ) {
      if ( process.env.NODE_ENV !== 'production' ) {
        console.log( `ObjectType[${ name }].resolve():`, source, query );
      }

      // A fields thunk, if it exists, has to be resolved after all dependencies are defined... so on nextTick (assuming dependencies are loaded synchronously) or later.
      const _fields = typeof fields === 'function' ? fields() : fields;

      // Check ObjectType definition.
      if ( process.env.NODE_ENV !== 'production' ) {
        if ( !_fields || typeof _fields !== 'object' ) throw new Error( `An ObjectType[${ name }] cannot be defined without fields.` );

        Object.keys( _fields ).forEach( fieldName => {
          const fieldDef = _fields[fieldName];

          if ( !fieldDef || typeof fieldDef !== 'object' ) throw new Error( `Field '${ fieldName }' on ObjectType[${ name }] has an invalid definition.` );

          const { type: fieldType } = fieldDef;

          if ( !fieldType || typeof fieldType !== 'object' || typeof fieldType.resolve !== 'function' ) {
            throw new Error( `Invalid field type on ObjectType[${ name }].${ fieldName }.` );
          }
        });
      }

      if ( typeof query !== 'object' ) {
        throw new Error( `Cannot resolve invalid query on ${ name }.` );
      }

      const keys = Object.keys( query.__fields );

      // If the source is null, then do not proceed with deeper resolution.
      if ( source === null ) {
        return Promise.resolve( source );
      }

      // Pass the source to the field resolver for each field that is represented in the query,
      // then recurse by taking the result as the "source" relevant to fields on that
      // source (if that node has fields).

      const resolvers = keys.map( key => {
        const fieldDef = _fields[key];
        const queryParams = query.__fields[key];

        if ( !fieldDef || !fieldDef.type ) {
          return Promise.reject( new Error( `Could not resolve a query including an undefined field. The field '${ key }' is not defined on ${ name }(${ Object.keys( _fields ).join( ', ' ) }).` ) );
        }

        const { resolve: fieldResolver, type: fieldType, args: fieldArgs } = fieldDef;

        // TODO: Validate query arguments: queryParams.args should match fieldDef.args.

        if ( typeof source === 'undefined' && process.env.NODE_ENV !== 'production' ) {
          console.warn( `Attempt to resolve field '${ key }' on ${ name } with undefined source.` )
        }

        return resolveArgs( queryParams.__args, fieldArgs )
          .then( args => fieldResolver ? fieldResolver( source, args, context, { nodeQuery: { __args: args, __fields: queryParams.__fields } }) : defaultFieldResolver( source, key ) )
          .then( value => fieldType.resolve( value, queryParams, context ) )
          .then( value => [
            key,
            value
          ]);
      });

      return Promise.all( resolvers )
        .then( results => results.reduce( ( acc, [key, value ]) => ({
          ...acc,
          [key]: value
        }), {}) )
    },

    /**
     * Accepts a graph payload and returns normalized records representing that graph.
     *
     * @param  { any } data The payload to be normalized.
     * @return { ref, records }
     */
    normalize( data: any, path: string = '__root' ): NormalizedResponse {
      if ( data === null ) {
        return {
          ref: data,
          records: {}
        };
      }

      // Resolve fields thunk.
      const $fields = typeof fields === 'function' ? fields() : fields;

      const nodeKey = data.id || path;

      const verticies = mapObject( data, ( value, key ) => {
        const field = $fields[key];

        if ( !field ) throw new Error( `Normalization failed. Field ${ key } is not defined on ${ name } [at ${ path }].` );

        const { type } = field;

        if ( typeof type !== 'object' || typeof type.normalize !== 'function' ) throw new Error( `Normalization failed. Invalid type for field ${ key } on ${ name }.` );

        return type.normalize( value, `${ nodeKey }:${ key }` );
      });

      const nodeRecord = {
        __key: nodeKey,
        __type: name,
        ...mapObject( verticies, ({ ref }) => ref )
      };

      return {
        ref: { __ref: nodeKey },
        records: reduceObject( verticies, ( acc, { records }) => mergeDeepLeft( acc, records ), { [nodeKey]: nodeRecord })
      };
    },

    traverse( selector: Selector, records: RecordMap ): Snapshot {
      const { ref, fragment } = selector;

      if ( ref === null ) {
        return {
          selector,
          graph: ref
        };
      }

      const { __ref: key } = ref;

      const record = records[key];

      // TODO Handle gap (missing record). The idea is that an actual API request can be trimmed to that graph that is not
      // available in the local store. In the meantime, we throw an error.
      if ( !record ) throw new Error( `Traversal failed. No record for ${ key }.` );

      // Resolve fields thunk.
      const $fields = typeof fields === 'function' ? fields() : fields;

      const { __fields } = fragment;

      const parts = mapObject( __fields, ( fragmentPart, fragmentKey ) => {
        const field = $fields[fragmentKey];
        if ( !field ) throw new Error( `Traversal failed. Can't traverse undefined field ${ fragmentKey } on ${ name }.` );

        const { type } = field;
        if ( typeof type !== 'object' || typeof type.traverse !== 'function' ) throw new Error( `Traversal failed. Invalid type for ${ fragmentKey } on ${ name }.` );
        // TODO: Type validation can happen at time of definition.

        return type.traverse({ ref: record[fragmentKey], fragment: fragmentPart }, records );
      });

      return {
        selector,
        graph: mapObject( parts, ({ graph }) => graph )
      };
    }
  };
}
