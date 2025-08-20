import type { Diff } from '~/i18n/types.d.ts'

import type { DefaultLocaleKeys } from './types.d.ts'

const locale = {
	'Welcome!': 'Bienvenue !',
} as const

export default locale satisfies
	// Static type check for missing keys
	Readonly<Record<Diff<DefaultLocaleKeys, keyof typeof locale>, string>> &
	// Static type check for extra keys
	Readonly<Record<Diff<keyof typeof locale, DefaultLocaleKeys>, never>>
