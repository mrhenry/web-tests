const fs = require('fs');
const path = require('path');

function build() {
	const out = {
		ecma262: {
			bySection: {},
			items: [],
		},
		geometry_1: {
			bySection: {},
			items: [],
		},
		url: {
			bySection: {},
			items: [],
		}
	};

	fs.readdirSync(path.join(__dirname, '../ecma262/')).forEach((item) => {
		const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '../ecma262/', item, 'meta.json')));
		const index = out.ecma262.items.length;
		meta.path = path.join('ecma262/', item);

		out.ecma262.items.push(meta);
		out.ecma262.bySection[meta.spec.section] = index;
	});

	fs.readdirSync(path.join(__dirname, '../geometry-1/')).forEach((item) => {
		const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '../geometry-1/', item, 'meta.json')));
		const index = out.geometry_1.items.length;
		meta.path = path.join('geometry-1/', item);

		out.geometry_1.items.push(meta);
		out.geometry_1.bySection[meta.spec.section] = index;
	});

	fs.readdirSync(path.join(__dirname, '../url/')).forEach((item) => {
		const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '../url/', item, 'meta.json')));
		const index = out.url.items.length;
		meta.path = path.join('url/', item);

		out.url.items.push(meta);
		out.url.bySection[meta.spec.section] = index;
	});

	fs.writeFileSync(path.join(__dirname, '../lib/mapping.json'), JSON.stringify(out, undefined, "  "));
}

build();
console.log('updated lib/mapping.json');
