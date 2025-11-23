import { i18n as i18nConfig } from '~/config'
import type { Locales, I18nKeys } from './types.d.ts'

export const defaultLocale = i18nConfig.defaultLocale

export const locales = new Set(i18nConfig.locales.map(locale => typeof locale === 'string' ? locale : locale.path))

function getLocaleKeysValue(
	localeKeys: Record<string, any> | undefined,
	key: string,
): string | undefined
{
	if (!key)
	{
		// No key provided
		return undefined
	}

	// Try to access the exact key
	let value = localeKeys?.[key]
	if (value !== undefined)
	{
		return typeof value === 'string' ? value : undefined
	}

	// Otherwise, try to access nested keys
	const keysPath = key.split('.')
	let currentLocaleKeys: typeof localeKeys | string = localeKeys
	for (const keyPart of keysPath)
	{
		if (!currentLocaleKeys || typeof currentLocaleKeys !== 'object' || !(keyPart in currentLocaleKeys))
		{
			currentLocaleKeys = undefined
			break
		}

		currentLocaleKeys = currentLocaleKeys[keyPart]
	}
	if (typeof currentLocaleKeys === 'string')
	{
		return currentLocaleKeys
	}

	return undefined
}

export function i18n(
	locale: Locales | undefined,
	keys: I18nKeys | string,
	...args: any[]
): string
{
	let value: string = ''

	if (typeof keys !== 'string')
	{
		// Try to get the value for the requested locale
		// Otherwise, try to get the value for the default locale
		// Otherwise, get the first value from the keys object
		value = (
			keys[locale!]
			?? keys[defaultLocale]
			?? Object.values(keys)[0]
			?? ''
		)
	}
	else if (keys)
	{
		// Try to get the value from requested locale keys
		// Otherwise, try to get the value from default locale keys
		// Otherwise, fallback to the key itself
		value = (
			getLocaleKeysValue(i18nConfig.localeKeys?.[locale!], keys)
			?? getLocaleKeysValue(i18nConfig.localeKeys?.[defaultLocale], keys)
			?? keys
			?? ''
		)
	}

	if (!value)
	{
		return value
	}

	if (args.length >= 1)
	{
		if (typeof args[0] === 'object')
		{
			// Arguments are passed as a dictionary
			return value.replaceAll(
				/{([^}]+)}/g,
				(match, key) => String(args[0][key] ?? match),
			)
		}

		// Arguments are passed as an array
		return value.replaceAll(
			/{(\d+)}/g,
			(match, number) => String(args[Number.parseInt(number)] ?? match),
		)
	}

	return value
}
