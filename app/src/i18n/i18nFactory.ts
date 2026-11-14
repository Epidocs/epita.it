import { i18n as i18nConfig } from '~/config'
import { i18n } from './i18n'
import type { Locales, Tail } from './types.d.ts'

export function i18nFactory(locale: string | undefined)
{
	return (...args: Tail<Parameters<typeof i18n>>) => i18n((locale ?? i18nConfig.defaultLocale) as Locales, ...args)
}
