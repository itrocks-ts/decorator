const assert = require('node:assert/strict')
const { test } = require('node:test')
const { decoratorOf } = require('../cjs/property')
const { ConstructorProperties, DYNAMIC, FIXED } = require('./cjs/constructor')

test('constructor parameter decorators resolve the declaring class and property names', () => {
	assert.equal(decoratorOf(ConstructorProperties, 'first', FIXED), 'first')
	assert.equal(decoratorOf(ConstructorProperties, 'second', DYNAMIC), 'second')
	assert.equal(decoratorOf(new ConstructorProperties(), 'first', FIXED), 'first')
})
