// @flow
export const mapObject = ( obj: {}, fn: ( val: any, key: string ) => any ): {} =>
  Object.keys( obj ).reduce( ( acc, key ) => ({
    ...acc,
    [key]: fn( obj[key], key )
  }), {});

export const reduceObject = ( obj: {}, fn: ( acc: any, val: any, key: string ) => any, acc: any ): any =>
  Object.keys( obj ).reduce( ( innerACC, key ) => fn( innerACC, obj[key], key ), acc );
