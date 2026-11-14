import { describe, expect, test } from 'vitest'
import {
	getRelativeLocaleUrl,
	getRelativeLocaleUrlList,
	getPathByLocale,
	getLocaleByPath,
} from 'astro:i18n'

import { getLocaleUrlList } from '~/i18n'

import {
	defaultLocale,
	localePaths,
	otherLocale,
	otherLocalePaths,
	getCodes,
	getLocaleUrl,
} from '~test/helpers/i18n'

const pages = (page: string) => localePaths.map(locale => getLocaleUrl(locale, page))

describe('getRelativeLocaleUrl', () =>
{
	test.each(localePaths)('%s', (locale) =>
	{
		expect(getRelativeLocaleUrl(locale)).toBe(getLocaleUrl(locale))
		expect(getRelativeLocaleUrl(locale, '')).toBe(getLocaleUrl(locale))
		expect(getRelativeLocaleUrl(locale, 'getting-started')).toBe(getLocaleUrl(locale, 'getting-started'))
	})

	test('supports prependWith', () =>
	{
		const locale = otherLocale ?? defaultLocale
		expect(getRelativeLocaleUrl(locale, 'getting-started', { prependWith: 'blog' }))
			.toBe(`/blog${getLocaleUrl(locale, 'getting-started')}`)
		expect(getRelativeLocaleUrl(locale, 'getting-started', { prependWith: 'blog', normalizeLocale: false }))
			.toBe(`/blog${getLocaleUrl(locale, 'getting-started')}`)
	})
})

describe('getRelativeLocaleUrlList', () =>
{
	test('lists the URL of every locale', () =>
	{
		expect(getRelativeLocaleUrlList('about')).toEqual(pages('about'))
	})

	test('supports prependWith', () =>
	{
		expect(getRelativeLocaleUrlList('about', { prependWith: 'blog' }))
			.toEqual(pages('about').map(url => `/blog${url}`))
	})
})

describe('getPathByLocale', () =>
{
	describe.each(localePaths)('%s', (path) =>
	{
		test.each(getCodes(path))('%s -> path', (code) =>
		{
			expect(getPathByLocale(code)).toBe(path)
		})
	})
})

describe('getLocaleByPath', () =>
{
	test.each(localePaths)('returns the first locale code of path "%s"', (path) =>
	{
		expect(getLocaleByPath(path)).toBe(getCodes(path)[0])
	})
})

describe('getLocaleUrlList', () =>
{
	test('lists locales for a path without locale', () =>
	{
		const list = getLocaleUrlList('/about')
		expect(list.map(({ locale }) => locale)).toEqual(localePaths)
	})

	test.each(localePaths)('ignores the current locale prefix ("%s")', (locale) =>
	{
		const list = getLocaleUrlList(getLocaleUrl(locale, 'about'))
		expect(list.map(({ url }) => new URL(url, 'http://x').pathname)).toEqual(pages('about'))
	})

	test.runIf(otherLocale !== undefined)('can exclude a locale', () =>
	{
		const list = getLocaleUrlList('/about', otherLocale)
		expect(list.map(({ locale }) => locale)).toEqual(
			localePaths.filter(locale => locale !== otherLocale),
		)
		expect(otherLocalePaths).toContain(otherLocale)
	})
})
