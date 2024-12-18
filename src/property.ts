import 'reflect-metadata'
import { KeyOf, ObjectOrType, prototypeOf } from '@itrocks/class-type'

export type DecorateCaller<T extends object> = (target: T, property: KeyOf<T>) => void

export type DecoratorCallback<T extends object, V = any> = (target: T, property: KeyOf<T>) => V

export function decorate<T extends object>(name: Symbol, value: any): DecorateCaller<T>
{
	return (target: T, property: KeyOf<T>) => Reflect.defineMetadata(name, value, target, property)
}

export function decorateCallback<T extends object>(name: Symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
{
	return (target, property) => Reflect.defineMetadata(name, callback(target, property), target, property)
}

export function decoratorOf<V, T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedValue?: V
): V
{
	const result = Reflect.getMetadata(name, prototypeOf(target), property)
	return (result === undefined)
		? undefinedValue
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
