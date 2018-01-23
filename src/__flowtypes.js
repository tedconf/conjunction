// @flow
export type MutateSignature = ( action: string, ...args: Array<*> ) => Promise<*>;

export type FieldDefinitions = {};

export type Pointer = {
  __ref: string
};

export type Record = {};

export type RecordMap = {
  [key: string]: Record
};

export type NormalizedResponse = {
  ref: Pointer,
  records: RecordMap
};

export type Selector = {
  ref: any,
  fragment: any
};

export type Snapshot = {
  selector: Selector,
  graph: mixed,
  nodes?: any,
  gaps?: any
};

export type Observer = {
  next: ( data: mixed ) => any,
  error: ( err: any ) => any
};

export type Subscription = {
  unsubscribe: ( void ) => void
};

export type Updater = ( RecordMap, context: any ) => RecordMap;
