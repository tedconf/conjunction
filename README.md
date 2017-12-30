# Data Connectors

## Defining Custom Field Resolvers

By default, fields on custom types (`ObjectType`) will be resolved by matching
the field name to properties on type source. However, where fields represent
nested objects (types) or other relational data, it may be necessary to implement
custom field sources.

```
const Ship = ObjectType({
  name: 'Ship',
  fields: {
    id: {
      type: StringType
    },
    name: {
      type: StringType
    },
    crew: {
      type: ArrayType( Person ),
      source: ( ship ) => fetch( `/ships/${ ship.id }/crew` )
    }
  }
})
```

The source function has the following signature:

```
function( source, args, context ) : any
```

## Implementation Plan

1. Minimum Viable Component

    - Translate component queries to actionable API calls.
    - Execute queries on component mount.
    - Update data on intersecting actions.

2. Pagination

3. Caching

4. Subscriptions

## Concepts

- Queries
- Parameters
- Fragments
