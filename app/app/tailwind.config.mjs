import { addDynamicIconSelectors } from '@iconify/tailwind'

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
	],
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {},
	},
	plugins: [
		addDynamicIconSelectors(),
	],
}
