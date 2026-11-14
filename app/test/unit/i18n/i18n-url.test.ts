import { describe, expect, test } from 'vitest'

import { getLocaleByUrl, getUrlWithoutLocale } from '~/i18n'

import { defaultLocale, localePaths } from '~test/helpers/i18n'

describe('getLocaleByUrl', () =>
{
	describe.each(localePaths)('locale "%s"', (locale) =>
	{
		test.each([
			[`/${locale}/about`],
			[`/${locale}/`],
			[`/${locale}`],
			[`https://example.com/${locale}/about`],
		])('detects the locale of %s', (url) =>
		{
			expect(getLocaleByUrl(url)).toBe(locale)
		})
	})

	test('accepts a URL object', () =>
	{
		const locale = localePaths[localePaths.length - 1]!
		expect(getLocaleByUrl(new URL(`https://example.com/${locale}/about`))).toBe(locale)
	})

	test('falls back to the default locale', () =>
	{
		expect(getLocaleByUrl('/about')).toBe(defaultLocale)
		expect(getLocaleByUrl('/')).toBe(defaultLocale)
	})

	test('returns undefined without fallback when no locale is found', () =>
	{
		expect(getLocaleByUrl('/about', false)).toBeUndefined()
	})
})

describe('getUrlWithoutLocale', () =>
{
	describe.each(localePaths)('locale "%s"', (locale) =>
	{
		test.each([
			[`/${locale}/about`, '/about'],
			[`/${locale}`, '/'],
			[`/${locale}/`, '/'],
		])('strips the locale from %s', (url, expected) =>
		{
			expect(getUrlWithoutLocale(url)).toBe(expected)
		})
	})

	test.each([
		['/about', '/about'],
		['/', '/'],
	])('keeps %s as is', (url, expected) =>
	{
		expect(getUrlWithoutLocale(url)).toBe(expected)
	})

	test('accepts a URL object', () =>
	{
		const locale = localePaths[localePaths.length - 1]!
		expect(getUrlWithoutLocale(new URL(`https://example.com/${locale}/about`))).toBe('/about')
	})
})
