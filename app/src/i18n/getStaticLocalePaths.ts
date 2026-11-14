import { defaultLocale, locales } from './i18n'

export function getStaticLocalePaths()
{
	return [...locales]
		.filter(locale => locale !== defaultLocale)
		.map(locale => ({ params: { locale } }))
}
