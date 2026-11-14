import { test, expect } from '@playwright/test'

import {
	defaultLocale,
	otherLocale,
	getLocaleUrl,
	translate,
} from '~test/helpers/i18n'

test('has title', async ({ page }) =>
{
	await page.goto('/')
	await expect(page).toHaveTitle('EPITA.it')
});

test('renders the default locale', async ({ page }) =>
{
	await page.goto(getLocaleUrl(defaultLocale))
	await expect(
		page.getByText(
			translate(defaultLocale, 'Portal to services and projects related to EPITA.'),
			{ exact: true },
		),
	).toBeVisible()
});

test('renders a translated page', async ({ page }) =>
{
	test.skip(!otherLocale, 'Only one locale configured')

	await page.goto(getLocaleUrl(otherLocale!))
	await expect(
		page.getByText(
			translate(otherLocale!, 'Portal to services and projects related to EPITA.'),
			{ exact: true },
		),
	).toBeVisible()
});

test('switches locale from the picker', async ({ page }) =>
{
	test.skip(!otherLocale, 'Only one locale configured')

	await page.goto(getLocaleUrl(defaultLocale))
	await page.locator(`.lang-list a[href="${getLocaleUrl(otherLocale!)}"]`).click()
	await expect(page).toHaveURL(new RegExp(`${getLocaleUrl(otherLocale!)}$`))
	await expect(
		page.getByText(
			translate(otherLocale!, 'Portal to services and projects related to EPITA.'),
			{ exact: true },
		),
	).toBeVisible()
});

test('shows the 404 page for unknown routes', async ({ page }) =>
{
	const response = await page.goto('/does-not-exist')
	expect(response?.status()).toBe(404)
});
