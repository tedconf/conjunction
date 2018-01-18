// @flow
export type MutateSignature = ( action: string, ...args: Array<*> ) => Promise<*>;

export type FieldDefinitions = {};

export type Pointer = {};

export type Record = {};

export type RecordMap = {
  [key: string]: Record
};

export type NormalizedResponse = {
  ref: Pointer,
  records: RecordMap
};
