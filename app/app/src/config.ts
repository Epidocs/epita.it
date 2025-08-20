import type { AstroConfig } from 'astro'

import en from './i18n/locales/en'
import fr from './i18n/locales/fr'

export interface LocaleKeys
{
	[key: string]: LocaleKeys | string
}

export type LocalesKeys = Record<string, LocaleKeys>

export type I18nConfig = AstroConfig['i18n'] & { localeKeys?: LocalesKeys }

export const i18nLocales = [
	{
		codes: ['en', 'en_US'],
		path: 'en',
	},
	{
		codes: ['fr', 'fr_FR'],
		path: 'fr',
	},
] as const satisfies I18nConfig['locales']

export const i18nDefaultLocale = i18nLocales[0].path

export const i18n = {
	locales: i18nLocales,
	defaultLocale: i18nDefaultLocale,
	fallback: {
		fr: 'en',
	},
	localeKeys: {
		en,
		fr,
	},
	routing: {
		prefixDefaultLocale: false,
		redirectToDefaultLocale: true,
		fallbackType: 'rewrite',
	},
} as const satisfies I18nConfig
