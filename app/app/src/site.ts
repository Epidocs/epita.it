interface Site
{
	title?: string
	description?: string
	author?: string
	keywords?: string[]
	themeColor?: string
	lang?: string
	gtag?: string
}

const site: Site = {
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
	themeColor: '#183048',
	lang: 'en',
	// gtag: 'UA-140860210-2',
}

export default site

export type {
	Site,
}
