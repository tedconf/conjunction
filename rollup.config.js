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
      file: 'dist/conjunction.umd.js',
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
            "modules": false
          }],
          "stage-1"
        ],
        plugins: [
          "annotate-pure-calls",
          "external-helpers"
        ]
      }),
      commonjs()
    ]
  },
  {
    input: 'src/index.js',
    external: ( id ) => !!id.match( /^(babel-runtime|react|prop-types)/i ),
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
            "modules": false
          }],
          "stage-1"
        ],
        plugins: [
          "annotate-pure-calls",
          "transform-runtime"
        ]
      }),
      commonjs()
    ]
  }
];
