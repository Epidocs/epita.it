import { getLocaleByPath } from 'astro:i18n'

import { i18n as i18nConfig } from '~/config'

export function getLocaleByUrl(url: URL | string, fallback?: true): string
export function getLocaleByUrl(url: URL | string, fallback: false): string | undefined
export function getLocaleByUrl(url: URL | string, fallback: boolean = true): string | undefined
{
	const urlParts = typeof url === 'string' ? url.split('/') : url.pathname.split('/')

	for (const part of urlParts)
	{
		if (!part)
		{
			continue
		}

		try
		{
			const locale = getLocaleByPath(part)
			if (locale)
			{
				return locale
			}
		}
		catch (error)
		{}
	}

	return fallback ? i18nConfig.defaultLocale : undefined
}
