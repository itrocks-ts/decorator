[![npm version](https://img.shields.io/npm/v/@itrocks/decorator?logo=npm)](https://www.npmjs.com/package/@itrocks/decorator)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/decorator)](https://www.npmjs.com/package/@itrocks/decorator)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/decorator?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/decorator)
[![issues](https://img.shields.io/github/issues/itrocks-ts/decorator)](https://github.com/itrocks-ts/decorator/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://discord.gg/WFPJjmUx)

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

To ensure proper behavior, configure your `tsconfig.json` to enable experimental decorators and metadata emission:
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
  import { decorate, decorateCallback, decoratorOf, decoratorOfCallback } from '@itrocks/reflect-decorator/class'
  ```
  For property decorators:
  ```ts
  import { decorate, decorateCallback, decoratorOf, decoratorOfCallback } from '@itrocks/reflect-decorator/property'
  ```

2. **Define Your Decorator:**\
  Use `decorate` or `decorateCallback` to define a new decorator that sets metadata on a class or property.

3. **Use Your Decorator:**\
  Apply your decorator to your class or property.

4. **Retrieve Metadata:**\
  Use `decoratorOf` or `decoratorOfCallback` to retrieve previously defined decorators from metadata values,
  optionally providing a default fallback value or callback if none is present.

## Example use case

In these example, type helpers from dependency [@itrocks/class-type](https://www.npmjs.com/packages/@itrocks/classtype)
are used. Feel free using compatible types in your code, if you don't want to use those, but they are here to help.

### Class-level example

Define a persisting decorator, and its retrieval function:
```ts
import { decorate, decoratorOf } from '@itrocks/decorator/class'
import { ObjectOrType }          from '@itrocks/class-type'

const ACTIONS = Symbol('actions')

export function Actions(value: string[] = []) {
	return decorate(ACTIONS, value)
}

export function actionsOf(target: ObjectOrType) {
	return decoratorOf(target, ACTIONS, ['create', 'update', 'delete'])
}
```

Use your decorators into your classes, or not:
```ts
class FullService {}

@Actions(['create', 'update'])
class RestrictedService {}
```

Check your decorators values from anywhere in your code:
```ts
console.log(actionsOf(FullService))         // Outputs default: ['create', 'update', 'delete']
console.log(actionsOf(RestrictedService))   // Outputs ['create', 'update']
```

It works with objects too:
```ts
console.log(actionsOf(new RestrictedService))   // Outputs ['create', 'update']
```

### Property-level example

Define a persisting decorator, and its retrieval function:
```ts
import { decorate, decoratorOf } from '@itrocks/decorator/property'
import { KeyOf, ObjectOrType }   from '@itrocks/class-type'

const COMPONENT = Symbol('component')

function Component<T extends object>(value = true) {
	return decorate<T>(COMPONENT, value)
}

function componentOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) {
	return decoratorOf(target, property, COMPONENT, false)
}
```

Use your decorators into your classes, or not:
```ts
class Document 
{
	code: number

	@Component()
	components: Object[]
}
```

Check your decorators values from anywhere in your code:
```ts
console.log(componentOf(Document, 'code'))         // false
console.log(componentOf(Document, 'components'))   // true
```

It works with objects too:
```ts
console.log(componentOf(new Document, 'components'))   // true
```

### Tips and tricks

Experimental decorators allow you to dynamically call decorators after your class or property has been declared.
In the examples above, decorators may have been added dynamically while calling:
```ts
// Class decorator
Actions(['create', 'update'])(RestrictedService)

// Property decorator
Component<Document>()(Document.prototype, 'components')
```

## Class Decorator API

**Import Path:** `@itrocks/decorator/class`

### Types

Those type shortcuts are used to facilitate coding in TypeScript:
```ts
type DecorateCaller<T extends object> = (target: Type<T>) => void

type DecoratorCallback<T extends object, V = any> = (target: Type<T>) => V

type DecoratorOfType<V = any> = (target: ObjectOrType, name: Symbol, undefinedValue: V) => V
```
The API and the documentation refer to these types.

### decorate

```ts
function decorate<T extends object>(name: Symbol, value: any): DecorateCaller<T>
```
Creates a class decorator that persists a value associated to the class.

**Parameters:**
- `name: Symbol` – The unique symbol used as a key for the decorator data storage.
- `value: any` – The decorator value to store.

**Returns:** A decorator caller function that can be applied to a class `(target: Type<T>) => void`.

### decorateCallback

```ts
function decorateCallback<T extends object>(name: Symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
```
Similar to `decorate`, but the value is computed at decoration time by a callback function.

**Parameters:**
- `name: Symbol` – The unique symbol used as a key for the decorator data storage.
- `callback: (target: Type<T>) => any` – A function that returns a value to store.

**Returns:** A decorator caller function that can be applied to a class `(target: Type<T>) => void`.

**Example:**
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
Retrieves the decorator value from a class, returning a default value if none is set.

**Parameters:**
- `target: ObjectOrType` – The class or an instance of the class to retrieve decorator value from.
- `name: Symbol` – The decorator key to retrieve.
- `undefinedValue: V` – The value to return if no stored value is found for this decorator.

**Returns:** The stored decorator value, or `undefinedValue`.

**Example:**

Defines a retrieval function for the `AutoInfo` decorator previously defined (see example above):
```ts
import { decoratorOf } from '@itrocks/decorator/class'

function autoInfoOf(target: ObjectOrType) {
	return decoratorOf(target, INFO, 'no info')
}
```
If no decorator was defined for the target object or type, 'no info' will be returned.

### decoratorOfCallback

```ts
function decoratorOfCallback<T extends object, V>(target: ObjectOrType<T>, name: Symbol, undefinedCallback?: DecoratorCallback<T, V>): V
```
Retrieves the decorator value from a class. If not defined, computes and returns a value from the provided callback.

**Parameters:**
- `target: ObjectOrType<T>` - The class or an instance of that class the retrieve decorator value from.
- `name: Symbol` - The decorator key to retrieve.
- `undefinedCallback?: (target: Type<T>) => V` - A fallback function that returns a default value
  if no stored value is found for this decorator.

**Returns:** The stored or computed value.

**Example:**

Defines a retrieval function for the `AutoInfo` decorator previously defined (see example above):
```ts
import { decoratorOf } from '@itrocks/decorator/class'

function autoInfoOf<T extends object>(target: ObjectOrType) {
	return decoratorOfCallback<T, string>(target, INFO, target => `Class name: ${target.name}`)
}
```
If no decorator was defined for the target object or type,
'Class name:' and the name of the target type will be returned.

## Property Decorator API

**Import Path:** `@itrocks/decorator/property`

### Types

Those type shortcuts are used to facilitate coding in TypeScript:
```ts
type DecorateCaller<T extends object> = (target: T, property: KeyOf<T>) => void

type DecoratorCallback<T extends object, V = any> = (target: T, property: KeyOf<T>) => V
```
The API and the documentation refer to these types.

### decorate

```ts
function decorate<T extends object>(name: Symbol, value: any): DecorateCaller<T>
```
Defines a decorator for class properties, assigning a fixed value to the property’s metadata.

**Parameters:**
- `name: Symbol` - The unique symbol key for the decorator data storage.
- `value: any` - The decorator value to associate with the property.

**Returns:** A decorator caller function to be applied on a property.

### decorateCallback

```ts
function decorateCallback<T extends object>(name: Symbol, callback: DecoratorCallback<T>): DecorateCaller<T>
```
Similar to `decorate`, but the value is computed at decoration time by a callback function.

**Parameters:**
- `name: Symbol` - The unique symbol key for the decorator data storage.
- `callback: (target: T, property: KeyOf<T>) => any` - A function that returns a value to store.

**Returns:** A decorator caller function to be applied on a property.

**Example:**
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
Retrieves the decorator value from a class property, returning a default value if none is set.

**Parameters:**
- `target: ObjectOrType<T>` – The class or an instance of the class.
- `property: KeyOf<T>` – The name of the class property to retrieve decorator value from.
- `name: Symbol` – The decorator key to retrieve.
- `undefinedValue: V` – The value to return if no stored value is found for this decorator.

**Returns:** The stored decorator value, or `undefinedValue`.

**Example:**

Defines a retrieval function for the `Display` decorator previously defined (see example above):
```ts
import { decoratorOf } from '@itrocks/decorator/property'

function displayOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, DISPLAY)
}
```
If no decorator was defined for the target object or type, this will return `undefined`.

### decoratorOfCallback

```ts
function decoratorOfCallback<V, T extends object>(target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedCallback: DecoratorCallback<T, V>): V
```
Retrieves the decorator value from a class property. If not defined,
computes and returns a value from the provided callback.

**Parameters:**
- `target: ObjectOrType<T>` – The class or an instance of the class.
- `property: KeyOf<T>` – The name of the class property to retrieve decorator value from.
- `name: Symbol` – The decorator key to retrieve.
- `undefinedCallback?: (target: T, property: KeyOf<T>) => V` – A fallback function that returns a default value
  if no stored value is found for this decorator.

**Returns:** The stored or computed value.

**Example:**

Defines a retrieval function for the `Display` decorator previously defined (see example above):
```ts
import { decoratorOfCallback } from '@itrocks/decorator/property'
import { toDisplay }           from '@itrocks/rename'

function displayOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOfCallback<string, T>(target, property, DISPLAY, (_, property) => toDisplay(property))
}
```
If no decorator was defined for the target property, an automatically display matching the property name
will be calculated.
