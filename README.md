[![npm version](https://img.shields.io/npm/v/@itrocks/decorator?logo=npm)](https://www.npmjs.com/package/@itrocks/decorator)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/decorator)](https://www.npmjs.com/package/@itrocks/decorator)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/decorator?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/decorator)
[![issues](https://img.shields.io/github/issues/itrocks-ts/decorator)](https://github.com/itrocks-ts/decorator/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# decorator

A library that simplifies the declaration, persistence, and retrieval of decorator values.

It provides a convenient and consistent way to define decorators on classes and properties,
persist their associated metadata values, and retrieve these values later in your application code.
It also allows defining decorators with callbacks for dynamic metadata generation.

This library streamlines the process of:
- Defining class-level and property-level decorators that store metadata,
- Retrieving stored metadata values at runtime with default fallbacks,
- Facilitating callback-driven decorators that compute metadata values dynamically.

## Installation and Requirements

```bash
npm install @itrocks/decorator
```

To ensure proper behaviour, configure your `tsconfig.json` to enable experimental decorators and metadata emission:
```json
{
	"compilerOptions": {
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true
	}
}
```
This configuration ensures the decorators and their associated metadata are properly emitted and accessible at runtime.

## Getting Started

1. **Import the Tools:**
  For class decorators:
  ```ts
  import { decorate, decorateCallback, decoratorOf, decoratorOfCallback } from '@itrocks/decorator/class'
  ```
  For property decorators:
  ```ts
  import { decorate, decorateCallback, decoratorOf, decoratorOfCallback } from '@itrocks/decorator/property'
  ```

2. **Define your decorator:**\
  Use `decorate` or `decorateCallback` to define a new decorator that sets metadata on a class or property.

3. **Apply your decorator:**\
  Attach your decorator to the relevant class or property.

4. **Retrieve decorator values:**\
  Use `decoratorOf` or `decoratorOfCallback` to retrieve stored values from previously defined decorators.
  You can also provide a default fallback value or a callback if no data is present.

## Example use case

In these examples, type helpers from the dependency
[@itrocks/class-type](https://github.com/itrocks-ts/class-type) are used.
You can use compatible types from other sources if preferred, but these helpers are provided for convenience.

### Class-level example

Define a persistent decorator and its retrieval function:
```ts
import { ObjectOrType }          from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/class'

const ACTIONS = Symbol('actions')

export function Actions(value: string[] = []) {
	return decorate(ACTIONS, value)
}

export function actionsOf(target: ObjectOrType) {
	return decoratorOf(target, ACTIONS, ['create', 'update', 'delete'])
}
```

Use your decorators in your classes, or not:
```ts
class FullService {}

@Actions(['create', 'update'])
class RestrictedService {}
```

Retrieve decorator values from anywhere in your code:
```ts
console.log(actionsOf(FullService))         // Default: ['create', 'update', 'delete']
console.log(actionsOf(RestrictedService))   // ['create', 'update']
```

It also works with objects:
```ts
console.log(actionsOf(new RestrictedService))   // ['create', 'update']
```

### Property-level example

Define a persistent decorator and its retrieval function:
```ts
import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const COMPONENT = Symbol('component')

function Component<T extends object>(value = true) {
	return decorate<T>(COMPONENT, value)
}

function componentOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) {
	return decoratorOf(target, property, COMPONENT, false)
}
```

Use your decorators in your classes, or not:
```ts
class Document 
{
	code: number

	@Component()
	components: object[]
}
```

Retrieve decorator values from anywhere in your code:
```ts
console.log(componentOf(Document, 'code'))         // false
console.log(componentOf(Document, 'components'))   // true
```

It also works with objects:
```ts
console.log(componentOf(new Document, 'components'))   // true
```

### Tips and tricks

Experimental decorators allow you to dynamically apply them after your class or property has been declared.
In the examples above, decorators could have been added dynamically while calling:
```ts
// Class decorator
Actions(['create', 'update'])(RestrictedService)

// Property decorator
Component<Document>()(Document.prototype, 'components')
```

## Class Decorator API

**Import Path:** `@itrocks/decorator/class`

### Types

These TypeScript type shortcuts are used to simplify coding and improve readability:
```ts
type DecorateCaller<T extends object> = (target: Type<T>) => void

type DecoratorCallback<T extends object, V = any> = (target: Type<T>) => V

type DecoratorOfType<V = any> = (target: ObjectOrType, name: Symbol, undefinedValue: V) => V
```
The API and the documentation frequently refer to these types.

### decorate

```ts
function decorate<T extends object>(name: Symbol, value: any): DecorateCaller<T>
```
Creates a class decorator that persists a value associated with the class.

**Parameters:**
- `name: Symbol` – Unique key for storing the decorator data.
- `value: any` – The value to associate with the class decorator.

**Returns:**\
A decorator function that can be applied to a class `(target: Type<T>) => void`.

### decorateCallback

```ts
function decorateCallback<T extends object>(name: Symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
```
Similar to `decorate`, but computes the value dynamically at decoration time using a callback.

**Parameters:**
- `name: Symbol` – Unique key for storing the decorator data.
- `callback: (target: Type<T>) => any` – A function returning the value to store.

**Returns:**\
A decorator function that can be applied to a class: `(target: Type<T>) => void`.

**Example:**
Automatically decorates a class using its name: 
```ts
import { decorateCallback } from '@itrocks/decorator/class'

const INFO = Symbol('info')

function AutoInfo() {
  return decorateCallback(INFO, target => `Class name: ${target.name}`)
}

@AutoInfo()
class Example {}
```

### decoratorOf

```ts
function decoratorOf<V>(target: ObjectOrType, name: Symbol, undefinedValue: V): V
```
Retrieves the decorator value from a class, returning a default value if none is found.

**Parameters:**
- `target: ObjectOrType` – The class or an instance of the class.
- `name: Symbol` – The key of the decorator to retrieve.
- `undefinedValue: V` – A fallback value to return if no value is stored for this decorator.

**Returns:**\
The stored decorator value or the fallback value.

**Example:**

Defines a retrieval function for the previously defined `AutoInfo` decorator (see example above):
```ts
import { decoratorOf } from '@itrocks/decorator/class'

function autoInfoOf(target: ObjectOrType) {
	return decoratorOf(target, INFO, 'no info')
}
```
If no decorator is found, `'no info'` is returned.

### decoratorOfCallback

```ts
function decoratorOfCallback<T extends object, V>(
	target: ObjectOrType<T>, name: Symbol, undefinedCallback?: DecoratorCallback<T, V>
): V
```
Retrieves the decorator value from a class. If no value is defined, computes one using a fallback callback function.

**Parameters:**
- `target: ObjectOrType<T>` - The class or an instance of the class.
- `name: Symbol` - The key of the decorator to retrieve.
- `undefinedCallback?: (target: Type<T>) => V` - A function computing a fallback value if none is found.

**Returns:**\
The stored value or the computed value from the callback.

**Example:**

Defines a retrieval function for the previously defined `AutoInfo` decorator (see example above):
```ts
import { decoratorOfCallback } from '@itrocks/decorator/class'

function autoInfoOf<T extends object>(target: ObjectOrType) {
	return decoratorOfCallback<T, string>(target, INFO, target => `Class name: ${target.name}`)
}
```
If no decorator is found, the fallback dynamically computes `'Class name:'` followed by the class name.

### ownDecoratorOf

```ts
function ownDecoratorOf<V>(target: ObjectOrType, name: Symbol, undefinedValue: V): V
```
Similar to [decoratorOf](#decoratorof), without traversing the prototype chain.

### ownDecoratorOfCallback

```ts
function ownDecoratorOfCallback<T extends object, V>(
	target: ObjectOrType<T>, name: Symbol, undefinedCallback?: DecoratorCallback<T, V>
): V
```
Similar to [decoratorOfCallback](#decoratorofcallback), without traversing the prototype chain.

## Property Decorator API

**Import Path:** `@itrocks/decorator/property`

### Types

These TypeScript type shortcuts are used to simplify coding and improve readability:
```ts
type DecorateCaller<T extends object> = (target: T, property?: KeyOf<T>, index?: number) => void

type DecoratorCallback<T extends object, V = any> = (target: T, property: KeyOf<T>) => V
```
The API and the documentation frequently refer to these types.

`DecorateCaller` also works on constructor parameters (index-based).

### decorate

```ts
function decorate<T extends object>(name: Symbol, value: any): DecorateCaller<T>
```
Defines a decorator for class properties, assigning a fixed value to the property’s metadata.

**Parameters:**
- `name: Symbol` - Unique key used for storing the decorator data.
- `value: any` - The value to associate with the property.

**Returns:**\
A decorator function to be applied to a property.

### decorateCallback

```ts
function decorateCallback<T extends object>(name: Symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
```
Similar to `decorate`, but computes the value dynamically at decoration time using a callback.

**Parameters:**
- `name: Symbol` - Unique key used for storing the decorator data.
- `callback: (target: T, property: KeyOf<T>) => any` - A function returning the value to store.

**Returns:**\
A decorator function to be applied on a property: `(target: T, property: KeyOf<T>) => void`.

**Example:**
Automatically computes display names for properties:
```ts
import { decorateCallback } from '@itrocks/decorator/property'
import { toDisplay }        from '@itrocks/rename'

const DISPLAY = Symbol('display')

function Display<T extends object>(name = '') {
	return decorateCallback<T>(DISPLAY, (target, property) => name.length ? name : toDisplay(property))
}

class Example {
	@Display('forced display')
	aPropertyName = ''
	@Display() // automatic calculated display
	anotherPropertyName = ''
}
```

### decoratorOf

```ts
function decoratorOf<V, T extends object>(target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedValue?: V): V
```
Retrieves the decorator value from a class property, returning a default value if none is found.

**Parameters:**
- `target: ObjectOrType<T>` – The class or an instance of the class.
- `property: KeyOf<T>` – The name of the class property to retrieve decorator value from.
- `name: Symbol` – The key of the decorator to retrieve.
- `undefinedValue: V` – A fallback value to return if no value is stored for this decorator.

**Returns:**\
The stored decorator value or the fallback value.

**Example:**

Defines a retrieval function for the previously defined `Display` decorator (see example above):
```ts
import { decoratorOf } from '@itrocks/decorator/property'

function displayOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, DISPLAY)
}
```
If no decorator is found, this will return `undefined`.

### decoratorOfCallback

```ts
function decoratorOfCallback<V, T extends object>(target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedCallback: DecoratorCallback<T, V>): V
```
Retrieves the decorator value from a class property.
If no value is defined, computes one using a fallback callback function.

**Parameters:**
- `target: ObjectOrType<T>` – The class or an instance of the class.
- `property: KeyOf<T>` – The name of the property to retrieve decorator value from.
- `name: Symbol` – The key of the decorator to retrieve.
- `undefinedCallback?: (target: T, property: KeyOf<T>) => V` – A function computing a fallback value
  if no value is found.

**Returns:**\
The stored value or computed value from the callback.

**Example:**

Defines a retrieval function for the previously defined `Display` decorator (see example above):
```ts
import { decoratorOfCallback } from '@itrocks/decorator/property'
import { toDisplay }           from '@itrocks/rename'

function displayOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOfCallback<string, T>(target, property, DISPLAY, (_, property) => toDisplay(property))
}
```
If no decorator is found, the fallback dynamically computes a display name based on the property name.
