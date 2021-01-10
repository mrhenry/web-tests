const mapping = require('./mapping.json');

module.exports = {
	list: list,
	getMetaBySection: getMetaBySection,
}

function getMetaBySection(spec, section) {
	switch (spec) {
		case "ecma262":
			const index = mapping.ecma262.bySection[section];
			if (typeof index !== 'number') {
				return;
			}

			return mapping.ecma262.items[index];
	
		default:
			return;
	}
}

function list(spec) {
	switch (spec) {
		case "ecma262":
			return mapping.ecma262.items;
	
		default:
			return;
	}
}
