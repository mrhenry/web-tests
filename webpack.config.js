const path = require('path');

module.exports = [
	{
		mode: 'production',
		output: {
			filename: (pathData) => {
				if (pathData.chunk.name === 'main') {
					return 'test.babel_webpack.js';
				}

				console.warn('chunks are not supported')
				process.exit(1);
			}
		},
		target: [
				'web',
				'browserslist:IE 6 or Opera 9 or Safari 4 or Chrome 4 or Edge 12 or Firefox 2'
			],
		optimization: {
			minimize: false
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							comments: false,
							presets: [
								[
									'@babel/preset-env',
									{
										corejs: '^3.6.3',
										bugfixes: true,
										targets: {
											browsers: [
												"IE >= 6",
												"Opera >= 9",
												"Safari >= 4",
												"Chrome >= 4",
												"Edge >= 12",
												"Firefox >= 2"
											]
										},
										useBuiltIns: 'usage'
									}
								]
							]
						}
					}
				}
			]
		}
	}
];
