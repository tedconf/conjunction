import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    external: [
      'prop-types',
      'react'
    ],
    output: {
      name: 'Conjunction',
      file: pkg.browser,
      format: 'umd',
      globals: {
        'react': 'React',
        'prop-types': 'PropTypes'
      }
    },
    plugins: [
      resolve(),
      babel({
        presets: [
          "flow",
          "react",
          ["env", {
            "targets": {
              "browsers": ["last 2 versions", "safari >= 7"]
            },
            "modules": false
          }],
          "stage-1"
        ],
        plugins: [
          "external-helpers"
        ]
      }),
      commonjs()
    ]
  },
  {
    input: 'src/index.js',
    external: ( id ) => {
      const mods = [
        'prop-types',
        'react'
      ];

      if ( mods.indexOf( id ) !== -1 ) return true;

      return !!id.match( /^babel-runtime/i );
    },
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      resolve(),
      babel({
        runtimeHelpers: true,
        presets: [
          "flow",
          "react",
          ["env", {
            "targets": {
              "browsers": ["last 2 versions", "safari >= 7"]
            },
            "modules": false
          }],
          "stage-1"
        ],
        plugins: [
          "transform-runtime"
        ]
      }),
      commonjs()
    ]
  }
];
