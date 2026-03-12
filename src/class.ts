import 'reflect-metadata'
import { ObjectOrType } from '@itrocks/class-type'
import { Type }         from '@itrocks/class-type'
import { typeOf }       from '@itrocks/class-type'

export type DecorateCaller<T extends object> = (target: Type<T>) => void

export type DecoratorCallback<T extends object, V = any> = (target: Type<T>) => V

export type DecoratorOfType<V = any> = (target: ObjectOrType, name: symbol, undefinedValue: V) => V

export function decorate<T extends object>(name: symbol, value: any): DecorateCaller<T>
{
	return (target: Type<T>) => Reflect.defineMetadata(name, value, target)
}

export function decorateCallback<T extends object>(name: symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
{
	return (target: Type<T>) => Reflect.defineMetadata(name, callback(target), target)
}

export function decoratorOf<V>(target: ObjectOrType, name: symbol, undefinedValue: V): V
{
	const result = Reflect.getMetadata(name, typeOf(target))
	return (result === undefined)
		? undefinedValue
		: result
}

export function decoratorOfCallback<T extends object, V>(
	target: ObjectOrType<T>, name: symbol, undefinedCallback?: DecoratorCallback<T, V>
): V
{
	target = typeOf(target)
	return Reflect.getMetadata(name, target)
		?? undefinedCallback?.(target)
}

export function ownDecoratorOf<V>(target: ObjectOrType, name: symbol, undefinedValue: V): V
{
	const result = Reflect.getOwnMetadata(name, typeOf(target))
	return (result === undefined)
		? undefinedValue
		: result
}

export function ownDecoratorOfCallback<T extends object, V>(
	target: ObjectOrType<T>, name: symbol, undefinedCallback?: DecoratorCallback<T, V>
): V
{
	target = typeOf(target)
	return Reflect.getOwnMetadata(name, target)
		?? undefinedCallback?.(target)
}
