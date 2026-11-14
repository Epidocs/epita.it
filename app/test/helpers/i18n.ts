// Config-driven helpers for the template tests,
// so they keep passing when the i18n config in `src/config.ts` changes
// (locales added / removed, default locale changed...).

import { i18n as i18nConfig } from '~/config'

type LocaleEntry = string | { path: string, codes: readonly string[] }

const entries = i18nConfig.locales as readonly LocaleEntry[]

const toPath = (locale: LocaleEntry) => typeof locale === 'string' ? locale : locale.path
const toCodes = (locale: LocaleEntry) => typeof locale === 'string' ? [locale] : locale.codes

export const defaultLocale: string = i18nConfig.defaultLocale

/** Every locale path, in config order. */
export const localePaths: string[] = entries.map(toPath)

/** Locale paths other than the default one. */
export const otherLocalePaths: string[] = localePaths.filter(locale => locale !== defaultLocale)

/** First non-default locale, if any. */
export const otherLocale: string | undefined = otherLocalePaths[0]

/** All codes (e.g. `fr`, `fr_FR`) of a locale path. */
export function getCodes(path: string): string[]
{
	return toCodes(entries.find(locale => toPath(locale) === path)!) as string[]
}

export const prefixDefaultLocale: boolean = i18nConfig.routing.prefixDefaultLocale

/** Local path of a page for a locale, with trailing slash (e.g. `/fr/about/`). */
export function getLocaleUrl(locale: string, page = ''): string
{
	const segments = [page.replace(/^\/+|\/+$/g, '')]
	if (locale !== defaultLocale || prefixDefaultLocale)
	{
		segments.unshift(locale)
	}
	const joined = segments.filter(Boolean).join('/')
	return joined ? `/${joined}/` : '/'
}

const keys = i18nConfig.localeKeys as Record<string, Record<string, string>>

/** Expected translation of a top-level key, falling back to the default locale. */
export function translate(locale: string, key: string): string
{
	return keys[locale]?.[key] ?? keys[defaultLocale]?.[key] ?? key
}
