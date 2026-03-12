import 'reflect-metadata'
import { ObjectOrType }           from '@itrocks/class-type'
import { prototypeTargetOf }      from '@itrocks/class-type'
import { parameterNamesFromFile } from '@itrocks/parameter-name'

type Meta<T extends object>  = Extract<keyof T, string | symbol>
type Param<T extends object> = Extract<keyof T, string>

export type DecorateCaller<T extends object, K extends Meta<T> = Meta<T>> =
	(target: T, property?: K, index?: number) => void

export type DecoratorCallback<T extends object, V = any, K extends keyof T = keyof T> = (target: T, property: K) => V

export function decorate<T extends object>(name: symbol, value: any): DecorateCaller<T>
{
	return (target, property, index) => {
		const [targetObject, parameterName] = parameterDecorator(name, target, property, index)
		Reflect.defineMetadata(name, value, targetObject, parameterName)
	}
}

export function decorateCallback<T extends object>(name: symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
{
	return (target, property, index) => {
		const [targetObject, parameterName] = parameterDecorator(name, target, property, index)
		Reflect.defineMetadata(name, callback(target, property ?? parameterName), targetObject, parameterName)
	}
}

export function decoratorOf<V, T extends object>(
	target: ObjectOrType<T>, property: keyof T, name: symbol, undefinedValue?: V
): V
{
	const result = Reflect.getMetadata(name, prototypeTargetOf(target), metadataNameOf(property))
	return (result === undefined)
		? undefinedValue as V
		: result
}

export function decoratorOfCallback<V, T extends object>(
	target: ObjectOrType<T>, property: keyof T, name: symbol, undefinedCallback: DecoratorCallback<T, V>
): V
{
	const targetObject = prototypeTargetOf(target)
	return Reflect.getMetadata(name, targetObject, metadataNameOf(property))
		?? undefinedCallback(targetObject, property)
}

export function metadataNameOf<T extends object>(property: keyof T)
{
	return (
		(typeof property === 'number')
			? property.toString()
			: property
	) as Meta<T>
}

export function parameterDecorator<T extends object>(
	name: symbol, target: ObjectOrType<T>, property?: keyof T, index?: number
) : [T, Meta<T>]
{
	if (property !== undefined) {
		return [target as T, metadataNameOf(property)]
	}
	if (index === undefined) throw new Error(
		'Property decorator ' + name.description + ' with no property name nor constructor parameter index'
	)
	return [prototypeTargetOf(target), parameterName(target, index)]
}

function parameterName<T extends object>(target: T, index: number)
{
	let   key   = 0
	const stack = (new Error().stack ?? '').split('\n')
	const until = stack.length - 1
	while (!stack[key].match(/^\s*at Reflect\.decorate/) && (key < until)) {
		key ++
	}
	const line     = stack[key + 1]
	const fileName = line.slice(line.indexOf('(') + 1, line.lastIndexOf('.js:') + 3)
	return parameterNamesFromFile(fileName, target.constructor.name, 'constructor')[index] as Param<T>
}
