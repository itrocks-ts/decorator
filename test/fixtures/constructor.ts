import { decorate }         from '../../cjs/property'
import { decorateCallback } from '../../cjs/property'

export const DYNAMIC = Symbol('dynamic')
export const FIXED   = Symbol('fixed')

export class ConstructorProperties
{

	constructor(
		@decorate(FIXED, 'first') public first = '',
		@decorateCallback(DYNAMIC, (_, property) => property) readonly second = ''
	)
	{
	}

}
