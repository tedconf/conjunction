// The generic ScalarType is being added in connection with #13, but will necessarily
// be accompanied by significant changes in the graph normalization algorithm. In the
// context of Conjunction schema types, "scalar" refers to a leaf in the data graph.
//
// TODO: Most scalar types (e.g., StringType, BoolType,...) could be replaced with
// aliases to this ScalarType, since we only mutate the data associated with a scalar
// in rare cases (which would continue to have their own implementations).

export const ScalarType = {
  resolve: ( source ) => Promise.resolve( source ),

  normalize: value => ({
    ref: value,
    records: {}
  }),

  traverse: ({ ref }) => ({
    graph: ref
  })
};
