# imagemin-concurrent-skip-preserve-cli

> Minify images

## Install

```
$ npm install --global imagemin-concurrent-skip-preserve-cli
```

## Usage

```
$ imagemin --help
	Usage
	  $ imagemin input_folder --base-dir=input_dir --concurrency=4 -s "webp,jpg,jpeg" --out-dir=build

	Options
	  --concurrency			Number of parallel minification processes
	  --skip-extensions		Coma delimeted strinf of extensions to skip 
	  --out-dir				Output directory
	  --base-dir			Set base directory

	Examples
	$ imagemin input_dir/**/* --base-dir=input_dir --concurrency=4 --skip-extensions="webp,jpg,jpeg" --out-dir=build
```
