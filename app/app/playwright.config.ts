import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Forbid test.only on CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests on CI
  workers: (process.env.CI ? 1 : undefined) as any, // Opt out of parallel tests on CI
  reporter: process.env.CI ? 'github' : 'list', // See https://playwright.dev/docs/test-reporters#github-actions-annotations.

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry', // See https://playwright.dev/docs/trace-viewer.
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the local server before starting tests
  webServer: {
    command: 'pnpm run astro:preview',
    url: 'http://localhost:4321',
  },
});
