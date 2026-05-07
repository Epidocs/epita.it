import { defineConfig, envField } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

import { i18n } from '/src/config'

// https://astro.build/config
export default defineConfig({
	site: process.env.ASTRO_SITE_URL || undefined,
	base: process.env.ASTRO_BASE_PATH || undefined,
	build: {
		assetsPrefix: process.env.ASTRO_ASSETS_PREFIX || undefined,
	},
	integrations: [],
	vite: {
		plugins: [
			tailwindcss(),
		],
	},
	i18n: i18n,
	env: {
		schema: {
			// Deployment configuration
			APP_ENV: envField.enum({ context: 'client', access: 'public', optional: true, values: ['dev', 'test', 'prod'], default: 'prod' }),
			GITHUB_REPOSITORY_URL: envField.string({ context: 'client', access: 'public', optional: true }),
			GITHUB_SHA: envField.string({ context: 'client', access: 'public', optional: true }),
			VERSION_TAG: envField.string({ context: 'client', access: 'public', optional: true }),
			// Application configuration
			// Add env vars for your application here.
		},
		validateSecrets: true,
	},
})
