/* eslint-disable camelcase */
// Config file for running Rollup in "normal" mode (non-watch)

import rollupGitVersion from 'rollup-plugin-git-version';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import gitRev from 'git-rev-sync';
import pkg from '../package.json';
// import replace from "rollup-plugin-replace";
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import progress from 'rollup-plugin-progress';
// import clear from "rollup-plugin-clear";

let {version} = pkg;
let release;

// Skip the git branch+rev in the banner when doing a release build
if (process.env.NODE_ENV === 'release') {
	release = true;
} else {
	release = false;
	const branch = gitRev.branch();
	const rev = gitRev.short();
	version += '+' + branch + '.' + rev;
}

const banner = `/* @preserve
 * Leaflet ${version}, a JS library for interactive maps. http://leafletjs.com
 * (c) 2010-2020 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
`;

const outro = `var oldL = window.L;
exports.noConflict = function() {
	window.L = oldL;
	return this;
}

// Always export us to window global (see #2364)
window.L = exports;`;

export default () => {
	const buildType = typeof process.env.ROLLUP_BUILD_TYPE !== 'undefined'
    	? process.env.ROLLUP_BUILD_TYPE
		: 'modern';
	console.log('BuildType:', buildType);
	return {
		input: 'src/Leaflet.js',
		output: buildType === 'modern'  ?
			{
				file: 'dist/leaflet-src.esm.js',
				format: 'esm',
				banner: banner,
				sourcemap: true,
				freeze: false,
			} : [
				{
					file: 'dist/leaflet.js',
					format: 'umd',
					name: 'L',
					banner: banner,
					outro: outro,
					sourcemap: true,
					freeze: false,
					plugins: [
						terser({
							compress: {
								unused: false,
								collapse_vars: false
							},
							ecma: buildType === 'legacy' ? 5 : 2017,
							safari10: true,
							ie8: true
						})
					]
				},
				{
					file: 'dist/leaflet-src.js',
					format: 'umd',
					name: 'L',
					banner: banner,
					outro: outro,
					sourcemap: true,
					freeze: false,
					plugins: [
						terser({
							compress: false,
							mangle: false,
							keep_classnames: true,
							keep_fnames: true,
							toplevel: false,
							ecma: buildType === 'legacy' ? 5 : 2017,
							safari10: true,
							format: {
								beautify: true,
								comments: true
							},
							ie8:true
						})
					]
				},

				{
					file: 'dist/leaflet-src.esm.js',
					format: 'esm',
					banner: banner,
					sourcemap: true,
					freeze: false,
				}],
		plugins: [
			progress(),
			nodeResolve(),
			babel({
				/**
                * Uncomment to ignore node_modules. This will accelerate yur build,
                * but prevent you from using modern syntax in your dependencies
                */
				// exclude: "node_modules/**"
			}),
			globals(),
			builtins(),
			release ? json() : rollupGitVersion(),
		],
	};
};
