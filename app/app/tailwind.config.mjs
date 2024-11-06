import { addDynamicIconSelectors } from '@iconify/tailwind'

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '15px',
			},
		},
		screens: {
			sm: '540px',
			md: '720px',
			lg: '960px',
			xl: '1140px',
		},
	},
	plugins: [
		addDynamicIconSelectors(),
	],
	safelist: [
		'icon-[fa6-solid--bullhorn]',
		'icon-[fa6-solid--list-ul]',
		'icon-[fa6-solid--star]',
		'icon-[fa6-solid--user-group]',
		'icon-[fa-brands--discord]',
		'icon-[fa-brands--facebook]',
	],
}
