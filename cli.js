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
	  --jpg-quality			Use jpg quality 0-100 (Default 75)
	  --png-min-quality		Use png minimum quality 0-1 (Default 0.6)
	  --png-max-quality		Use png maximum quality 0-1 (Default 0.8)

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
  jpgQuality: {
    default: 75,
  },
  pngMinQuality: {
    default: 0.6,
  },
  pngMaxQuality: {
    default: 0.8,
  },
});

const spinner = ora(`Minifying images`);
const main = async function (input, opts) {
  const process = async (progress) => {
    const plugins = [
      jpeg({
        quality: opts.jpgQuality || 75
      }),
      png({
        quality: [
          opts.pngMinQuality || 0.6,
          opts.pngMaxQuality || 0.8
        ]
      }),
    ];

    await imagemin(
      input,
      {
        use: plugins,
        concurrency: opts.concurrency || 2,
        skipExtensions: opts.skipExtensions || '',
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

(async () => {
  if (cli.input.length === 0) {
    console.error('You should specify source folder');
    return;
  }

  if (!cli.flags.outDir && !cli.flags.baseDir) {
    cli.flags.outDir = cli.input;
    cli.flags.baseDir = cli.input;
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
