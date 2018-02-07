import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

import pkg from './package.json';

export default [
	{
		input: 'src/index.js',
		external: [
			'prop-types',
			'react'
		],
		output: {
			name: 'conjunction',
			file: pkg.browser,
			format: 'umd',
			globals: {
				'react': 'React',
				'prop-types': 'PropTypes'
			}
		},
		plugins: [
			resolve(),
			babel(),
			commonjs()
		]
	},
	{
		input: 'src/index.js',
		external: [
			'prop-types',
			'ramda',
			'rxjs',
			'react'
		],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
		plugins: [
			resolve(),
			babel(),
			commonjs()
		]
	},
	{
		input: 'src/index.js',
		external: [
			'prop-types',
			'ramda',
			'rxjs',
			'react'
		],
		output: [
			{ file: 'dist/conjunction.cjs.min.js', format: 'cjs', name: 'conjunction' }
		],
		plugins: [
			resolve(),
			babel(),
			commonjs(),
			uglify()
		]
	}
];
