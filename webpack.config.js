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
				'browserslist:IE 8 or Opera 12 or Safari 5.1 or Chrome 15 or Edge 12 or Firefox 4'
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
							targets: {
								browsers: [
									"IE >= 8",
									"Opera >= 12",
									"Safari >= 5.1",
									"Chrome >= 15",
									"Edge >= 12",
									"Firefox >= 4"
								]
							},
							presets: [
								[
									'@babel/preset-env',
									{
										corejs: '3.999999.999999',
										bugfixes: true,
									}
								]
							],
							plugins: [
								['polyfill-corejs3', { method: 'usage-global', version: '3.999999.999999' }]
							]
						}
					}
				}
			]
		}
	}
];
