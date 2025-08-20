import { localeKeys } from './keys'
import type { DefaultLocaleType } from './types.d.ts'

// Default locale uses keys as both keys and values
const locale = localeKeys
	.reduce<DefaultLocaleType>((acc, key) =>
		{
			(acc as any)[key] = key
			return acc
		},
		{} as DefaultLocaleType,
	)

export default locale
