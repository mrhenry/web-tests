module.exports = () => ({
	plugins: {
		'postcss-preset-env': {
			stage: 0,
			preserve: true,
			browsers: [
				'chrome >= 14',
				'edge >= 15',
				'firefox >= 4',
				'ie >= 8',
				'ios >= 10',
				'opera >= 12',
				'safari >= 7',
			]
		}
	},
});
