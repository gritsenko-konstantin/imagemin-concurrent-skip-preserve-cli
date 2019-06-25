#!/usr/bin/env node
'use strict';
const meow = require('meow');
const imagemin = require('imagemin-concurrent-skip-preserve');
const ora = require('ora');
const jpeg = require('imagemin-mozjpeg');
const png = require('imagemin-pngquant');

const cli = meow(`
	Usage
	  $ imagemin input_folder --base-dir=input_dir --concurrency=4 -s "webp,jpg,jpeg" --out-dir=build

	Options
	  --concurrency			Number of parallel minification processes
	  --skip-extensions		Coma delimeted strinf of extensions to skip 
	  --out-dir				Output directory
	  --base-dir			Set base directory

	Examples
	  $ imagemin input_dir/**/* ... --base-dir=input_dir --concurrency=4 --skip-extensions="webp,jpg,jpeg" --out-dir=build
`, {
	outDir: {
		type: 'string',
	},
	concurrency: {
		default: 1
	},
	skipExtensions: {
		type: 'string',
	},
	baseDir: {
		type: 'string',
	},
});

const DEFAULT_PLUGINS = [
	jpeg({quality: 75}),
	png({quality: [0.6, 0.8]}),
];

const spinner = ora(`Minifying images`);
const main = async function(input, opts) {
	const process = async (progress) => {
		await imagemin(
			input,
			{
				use: [
					jpeg({quality: 75}),
					png({quality: [0.6, 0.8]}),
				],
				concurrency: opts.concurrency || 2,
				skipExtensions: opts.skipExtensions,
				replaceOutputDir: output => {
					if (progress && progress instanceof Function) {
						progress(output);
					}
					return output.replace(`${opts.baseDir}/`, `${opts.outDir}/`)
				}
			},
		)
	};

	let count = 0;
	await process((f) => {
		spinner.start(`Minified: ${++count}`);
	});
};

(async() => {
	if (cli.input.length === 0) {
		console.error('You should specify source folder');
		return;
	}

	if (!cli.flags.outDir) {
		console.error('You should specify output directory');
		return;
	}

	if (cli.flags.outDir && !cli.flags.baseDir) {
		console.error('You should specify base directory with output directory');
		return;
	}

	if (cli.flags.skipExtensions) {
		cli.flags.skipExtensions = cli.flags.skipExtensions.replace(/\s/g, '').split(',');
	}

	const start = new Date();
	await main(cli.input, cli.flags);
	spinner.succeed(`Images minified in ${new Date() - start}ms`);
})();
