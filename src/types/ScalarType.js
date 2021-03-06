// The generic ScalarType is being added in connection with #13, but will necessarily
// be accompanied by significant changes in the graph normalization algorithm. In the
// context of Conjunction schema types, "scalar" refers to a leaf in the data graph.

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

export const BoolType = ScalarType;
export const FloatType = ScalarType;
export const IntType = ScalarType;
export const StringType = ScalarType;
