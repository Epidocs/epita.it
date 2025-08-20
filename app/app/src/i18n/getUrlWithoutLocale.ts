import { getLocaleByPath } from 'astro:i18n'

export function getUrlWithoutLocale(url: URL | string): string
{
	const urlPathnames = []
	const urlParts = typeof url === 'string' ? url.split('/') : url.pathname.split('/')

	let i = !urlParts[0] ? 1 : 0
	while (i < urlParts.length)
	{
		try
		{
			if (urlParts[i])
			{
				const locale = getLocaleByPath(urlParts[i] as string)
				if (locale)
				{
					++i
					continue
				}
			}
		}
		catch (error)
		{}

		urlPathnames.push(urlParts[i])
		++i
	}

	while (i < urlParts.length)
	{
		urlPathnames.push(urlParts[i])
		++i
	}

	return '/' + urlPathnames.join('/')
}
