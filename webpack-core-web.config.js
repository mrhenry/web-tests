module.exports = [
	// Modules
	{
		mode: 'production',
		output: {
			filename: (pathData) => {
				if (pathData.chunk.name === 'main') {
					return 'test.core-web_modules.js';
				}

				console.warn('chunks are not supported')
				process.exit(1);
			}
		},
		target: [
			'web',
			'browserslist:Opera 48 or Safari 10.1 or Chrome 61 or Edge 16 or Firefox 60'
		],
		optimization: {
			minimize: false
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					include: /(core-web\/modules|core-web\/helpers)/,
					use: {
						loader: 'babel-loader',
						options: {
							comments: false,
							targets: {
								browsers: [
									"Opera >= 48",
									"Safari >= 10.1",
									"Chrome >= 61",
									"Edge >= 16",
									"Firefox >= 60"
								]
							},
							presets: [
								[
									'@babel/preset-env',
									{}
								]
							],
							plugins: [
								[
									'polyfill-corejs3',
									{
										method: 'usage-global',
										version: '3.999999.999999',
										exclude: [
											"web.dom-collections.iterator",
											"web.dom-collections.for-each"
										]
									}
								]
							]
						}
					}
				},
				{
					test: /\.js$/,
					exclude: /(node_modules|core-web\/modules|core-web\/helpers)/,
					use: {
						loader: 'babel-loader',
						options: {
							comments: false,
							targets: {
								browsers: [
									"Opera >= 48",
									"Safari >= 10.1",
									"Chrome >= 61",
									"Edge >= 16",
									"Firefox >= 60"
								]
							},
							plugins: [
								[
									'@mrhenry/core-web',
									{
										browsers: {
											"opera": "48",
											"safari": "10.1",
											"chrome": "61",
											"edge": "16",
											"firefox": "60"
										},
										debug: false
									}
								],
								[
									'polyfill-corejs3',
									{
										method: 'usage-global',
										version: '3.999999.999999',
										exclude: [
											"web.dom-collections.iterator",
											"web.dom-collections.for-each"
										]
									}
								]
							],
							presets: [
								[
									'@babel/preset-env',
									{}
								]
							]
						}
					}
				}
			]
		}
	},

	// No Modules
	{
		mode: 'production',
		output: {
			filename: (pathData) => {
				if (pathData.chunk.name === 'main') {
					return 'test.core-web_no-modules.js';
				}

				console.warn('chunks are not supported')
				process.exit(1);
			}
		},
		target: [
			'web',
			'browserslist:IE 8 or Opera 12 or Safari 5 or Chrome 15 or Edge 12 or Firefox 4'
		],
		optimization: {
			minimize: false
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					include: /(core-web\/modules|core-web\/helpers)/,
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
									{}
								]
							],
							plugins: [
								[
									'polyfill-corejs3',
									{
										method: 'usage-global',
										version: '3.999999.999999',
										exclude: [
											"web.dom-collections.iterator",
											"web.dom-collections.for-each"
										]
									}
								]
							]
						}
					}
				},
				{
					test: /\.js$/,
					exclude: /(node_modules|core-web\/modules|core-web\/helpers)/,
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
							plugins: [
								[
									'@mrhenry/core-web',
									{
										browsers: {
											"ie": "8",
											"opera": "12",
											"safari": "5.1",
											"chrome": "15",
											"edge": "12",
											"firefox": "4"
										},
										debug: true
									}
								],
								[
									'polyfill-corejs3',
									{
										method: 'usage-global',
										version: '3.999999.999999',
										exclude: [
											"web.dom-collections.iterator",
											"web.dom-collections.for-each"
										]
									}
								]
							],
							presets: [
								[
									'@babel/preset-env',
									{}
								]
							]
						}
					}
				}
			]
		}
	}
];
