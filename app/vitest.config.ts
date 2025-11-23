/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

export default getViteConfig({
	test: {
		include: [
			// Default config
			'**/*.{test,spec}.?(c|m)[jt]s?(x)',
		],
		exclude: [
			// Default config
			'**/node_modules/**',
			'**/dist/**',
			'**/cypress/**',
			'**/.{idea,git,cache,output,temp}/**',
			'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
			// Custom config
			'**/test/e2e/**',
		],
	},
})
