// @flow
export type MutateSignature = ( action: string, ...args: Array<*> ) => Promise<*>;
