import { i18n as i18nConfig } from '~/config'
import { i18n } from './i18n'
import type { Tail } from './types.d.ts'

export function i18nFactory(locale: Parameters<typeof i18n>[0] | undefined)
{
	return (...args: Tail<Parameters<typeof i18n>>) => i18n(locale ?? i18nConfig.defaultLocale, ...args)
}
