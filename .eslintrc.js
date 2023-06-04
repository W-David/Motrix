module.exports = {
	root: true,
	env: {
		browser: true,
		node: true
	},
	extends: ['plugin:vue/essential', '@vue/standard', 'plugin:prettier/recommended'],
	parserOptions: {
		parser: 'babel-eslint'
	},
	globals: {
		appId: true,
		__static: true
	},
	rules: {
		'no-console': 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
	},
	overrides: [
		{
			files: ['*.vue'],
			rules: {
				indent: 'off'
			}
		}
	]
}
