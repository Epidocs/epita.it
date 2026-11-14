import { describe, expect, test } from 'vitest'

import { i18n } from '~/i18n/i18n'
import { i18nFactory } from '~/i18n/i18nFactory'

import { defaultLocale, otherLocale, translate } from '~test/helpers/i18n'

const hasOther = otherLocale !== undefined
const unknownLocale = '__unknown__'

describe('i18n', () =>
{
	test.runIf(hasOther)('translates a key for the requested locale', () =>
	{
		expect(i18n(otherLocale as any, 'Welcome!')).toBe(translate(otherLocale!, 'Welcome!'))
	})

	test('translates a key for the default locale', () =>
	{
		expect(i18n(defaultLocale as any, 'Welcome!')).toBe(translate(defaultLocale, 'Welcome!'))
	})

	test('falls back to the default locale keys for an unknown locale', () =>
	{
		expect(i18n(unknownLocale as any, 'Welcome!')).toBe(translate(defaultLocale, 'Welcome!'))
	})

	test('falls back to the key itself when it is unknown', () =>
	{
		expect(i18n(defaultLocale as any, 'Unknown key' as any)).toBe('Unknown key')
	})

	test.runIf(hasOther)('picks the requested locale from an inline dictionary', () =>
	{
		expect(i18n(otherLocale as any, { [defaultLocale]: 'Hello', [otherLocale!]: 'Hallo' } as any)).toBe('Hallo')
	})

	test('falls back to the default locale in an inline dictionary', () =>
	{
		expect(i18n(unknownLocale as any, { [defaultLocale]: 'Hello', zz: 'Hallo' } as any)).toBe('Hello')
	})

	test('replaces named arguments', () =>
	{
		expect(i18n(defaultLocale as any, { [defaultLocale]: 'Hi {name}' } as any, { name: 'Ada' })).toBe('Hi Ada')
	})

	test('replaces positional arguments', () =>
	{
		expect(i18n(defaultLocale as any, { [defaultLocale]: '{0} and {1}' } as any, 'a', 'b')).toBe('a and b')
	})
})

describe('i18nFactory', () =>
{
	test.runIf(hasOther)('binds the locale', () =>
	{
		expect(i18nFactory(otherLocale as any)('Welcome!')).toBe(translate(otherLocale!, 'Welcome!'))
	})

	test('uses the default locale when undefined', () =>
	{
		expect(i18nFactory(undefined)('Welcome!')).toBe(translate(defaultLocale, 'Welcome!'))
	})
})
