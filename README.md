# Less Terrible Coffeelint Loader

This was originally a fork of [coffeelint-loader](https://github.com/bline/coffeelint-loader), but it had some deficiencies. When I tried to fix them, I ended up replacing the whole thing.

I'm using this for an internal project at the company I work for, so don't expect this to work in the general case. While it may technically have support for some features, I have not tested all of them. PRs are welcome, however.

## Usage

Apply the Coffeelint loader as pre/postLoader in your webpack configuration:

``` javascript
module.exports = {
	module: {
		preLoaders: [
			{
				test: /\.coffee$/, // include .coffee files
				exclude: /node_modules/,
				loader: "less-terrible-coffeelint-loader"
			}
		]
	},

	// more options in the optional coffeelint object
	coffeelint: {
		// any coffeelint option http://www.coffeelint.com/#options
		// i. e.
		camel_case_classes: 'error',

		// coffeelint to not interrupt the compilation
		// if you want any file with coffeelint errors to fail
		// set failOnErrors to true
		failOnErrors: false,

        // same as failOnErrors but will throw an exception for
        // warnings as well
		failOnWarns: false,

		// custom reporter function
		reporter: function(errors) {
            this.emitWarning(errors.map(function(error) {
                return [
                    error.lineNumber,
                    error.message
                ].join(' ')
            }).join('\n'));
        }
	}
}
```

### Custom reporter

By default, `less-terrible-coffeelint-loader` will provide a default reporter.

However, if you prefer a custom reporter, pass a function under the `reporter` key in `coffeelint` options. (see *usage* above)

The reporter function will be passed the array returned from `coffeelint.lint` as well as a boolean indicating whether you should `emitError` or `emitWarning`:
```js
reporter.call(this, [
    {
        rule :      'Name of the violated rule',
        lineNumber: 'Number of the line that caused the violation',
        level:      'The severity level of the violated rule',
        message:    'Information about the violated rule',
        context:    'Optional details about why the rule was violated'
    }
], true); // emitErrors
```

The reporter function will be excuted with the loader context as `this`. You may emit messages using `this.emitWarning(...)` or `this.emitError(...)`. See [webpack docs on loader context](http://webpack.github.io/docs/loaders.html#loader-context).

The output in the Webpack CLI will usually be:
```
...

WARNING in ./path/to/file.js
<reporter output>

...
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

