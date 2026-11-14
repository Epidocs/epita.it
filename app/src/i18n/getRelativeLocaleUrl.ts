import { getRelativeLocaleUrl as astroGetRelativeLocaleUrl } from 'astro:i18n'

import { i18n as i18nConfig } from '~/config'
import type { Tail } from './types.d.ts'

export function getRelativeLocaleUrl(
	locale: string | undefined,
	...args: Tail<Parameters<typeof astroGetRelativeLocaleUrl>>
): string
{
	return astroGetRelativeLocaleUrl(locale || i18nConfig.defaultLocale, ...args)
}
