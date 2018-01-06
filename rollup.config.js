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
			babel({
				exclude: ['node_modules/**']
			}),
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
			babel({
				exclude: ['node_modules/**']
			}),
			commonjs()
		]
	}
];
