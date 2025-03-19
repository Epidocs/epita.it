import type { Props as BaseProps } from '~/layouts/Base.astro'

export interface Site
{
	lang?: BaseProps['lang']
	title?: BaseProps['title']
	description?: BaseProps['description']
	author?: BaseProps['author']
	keywords?: BaseProps['keywords']
	generator?: BaseProps['generator']
	themeColor?: BaseProps['themeColor']
	viewportScale?: BaseProps['viewportScale']
	favicon?: BaseProps['favicon']
	socialTitle?: BaseProps['socialTitle']
	socialDescription?: BaseProps['socialDescription']
	socialImage?: BaseProps['socialImage']
	socialUrl?: BaseProps['socialUrl']
	socialType?: BaseProps['socialType']
	socialTwitterCard?: BaseProps['socialTwitterCard']
}

export const site: Site = {
	lang: 'en',
	title: 'EPITA.it',
	description: 'Portail vers des services en lien avec l\'EPITA',
	author: 'Matiboux',
	keywords: [
		'Epidocs',
		'portail',
		'portal',
		'open',
		'source',
		'open-source',
		'services',
		'sites',
		'internet',
		'website',
		'documents',
		'utiles',
		'useful',
		'étudiants',
		'students',
		'EPITA',
	],
	favicon: '/assets/icon-48.png',
	themeColor: '#183048',
	viewportScale: 1,
	socialTitle: true,
	socialDescription: true,
	// gtag: 'UA-140860210-2',
}
