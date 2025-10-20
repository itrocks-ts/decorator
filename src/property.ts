import 'reflect-metadata'
import { KeyOf }                  from '@itrocks/class-type'
import { ObjectOrType }           from '@itrocks/class-type'
import { prototypeOf }            from '@itrocks/class-type'
import { parameterNamesFromFile } from '@itrocks/parameter-name'

export type DecorateCaller<T extends object> = (target: T, property?: KeyOf<T>, index?: number) => void

export type DecoratorCallback<T extends object, V = any> = (target: T, property: KeyOf<T>) => V

export function decorate<T extends object>(name: Symbol, value: any): DecorateCaller<T>
{
	return (target, property, index) => {
		[target, property] = parameterDecorator(name, target, property, index)
		Reflect.defineMetadata(name, value, target, property)
	}
}

export function decorateCallback<T extends object>(name: Symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
{
	return (target, property, index) => {
		[target, property] = parameterDecorator(name, target, property, index)
		Reflect.defineMetadata(name, callback(target, property), target, property)
	}
}

export function decoratorOf<V, T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedValue?: V
): V
{
	const result = Reflect.getMetadata(name, prototypeOf(target), property)
	return (result === undefined)
		? undefinedValue as V
		: result
}

export function decoratorOfCallback<V, T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedCallback: DecoratorCallback<T, V>
): V
{
	target = prototypeOf(target)
	return Reflect.getMetadata(name, target, property)
		?? undefinedCallback(target, property)
}

export function parameterDecorator<T extends object>(name: Symbol, target: T, property?: KeyOf<T>, index?: number)
	: [T, KeyOf<T>]
{
	if (property === undefined) {
		if (target instanceof Function) {
			target = target.prototype
		}
		property = parameterName(name, target, index)
	}
	return [target, property]
}

function parameterName<T extends object>(name: Symbol, target: T, index?: number): KeyOf<T>
{
	if (index === undefined) {
		throw new Error(
			'Property decorator ' + name.description + ' with no property name nor constructor parameter index'
		)
	}
	let   key   = 0
	const stack = (new Error().stack ?? '').split('\n')
	const until = stack.length - 1
	while (!stack[key].match(/^\s*at Reflect\.decorate/) && (key < until)) {
		key ++
	}
	const line     = stack[key + 1]
	const fileName = line.slice(line.indexOf('(') + 1, line.lastIndexOf('.js:') + 3)
	return parameterNamesFromFile(fileName, target.constructor.name, 'constructor')[index] as KeyOf<T>
}
