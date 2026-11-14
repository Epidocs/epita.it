import { describe, expect, test } from 'vitest'

import { i18n } from '~/config'
import { diffLocaleKeys } from '~/i18n/validateLocaleKeys'

const { [i18n.defaultLocale]: defaultKeys, ...otherLocales } =
	i18n.localeKeys as Record<string, any>

describe('locale keys', () =>
{
	test('the default locale has keys', () =>
	{
		expect(defaultKeys).toBeDefined()
	})

	test.each(Object.entries(otherLocales))('"%s" matches the default locale keys', (_locale, keys) =>
	{
		expect(diffLocaleKeys(defaultKeys, keys)).toBeUndefined()
	})
})

describe('diffLocaleKeys', () =>
{
	test('reports missing and extra keys', () =>
	{
		expect(diffLocaleKeys({ a: 'a', b: 'b' }, { b: 'b', c: 'c' })).toEqual({
			a: 'missing',
			c: 'extra',
		})
	})

	test('reports nested differences with dotted paths', () =>
	{
		expect(diffLocaleKeys({ a: { b: 'b', c: 'c' } }, { a: { b: 'b' } })).toEqual({
			'a.c': 'missing',
		})
	})

	test('returns undefined when keys match', () =>
	{
		expect(diffLocaleKeys({ a: { b: 'b' } }, { a: { b: 'x' } })).toBeUndefined()
	})
})
