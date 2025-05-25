import { defineConfig, envField } from 'astro/config'
import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind(),
	],
	vite: {
		plugins: [],
	},
	env: {
		schema: {
			GITHUB_REPOSITORY_URL: envField.string({ context: 'client', access: 'public', optional: true }),
			GITHUB_SHA: envField.string({ context: 'client', access: 'public', optional: true }),
		},
		validateSecrets: true,
	},
})
