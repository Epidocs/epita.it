export function diffLocaleKeys(
	referenceLocaleKeys: Record<string, any>,
	currentLocaleKeys: Record<string, any>,
): Record<string, 'missing' | 'extra'> | undefined
{
	const diffKeys: Record<string, 'missing' | 'extra'> = {}

	const referenceKeys = Object.keys(referenceLocaleKeys)
	const currentKeys = Object.keys(currentLocaleKeys)

	// Compute missing keys
	const missingKeys = new Set(referenceKeys)
	for (const key of currentKeys)
	{
		missingKeys.delete(key)
	}
	for (const key of missingKeys)
	{
		diffKeys[key] = 'missing'
	}

	// Compute extra keys
	const extraKeys = new Set(currentKeys)
	for (const key of referenceKeys)
	{
		extraKeys.delete(key)
	}
	for (const key of extraKeys)
	{
		diffKeys[key] = 'extra'
	}

	// Look for nested keys to compare
	const nestedKeys = referenceKeys.filter(key => typeof referenceLocaleKeys[key] !== 'string')
	for (const key of nestedKeys)
	{
		const nestedDiffKeys = diffLocaleKeys(
			referenceLocaleKeys[key],
			currentLocaleKeys[key],
		)
		for (const nestedKey in nestedDiffKeys)
		{
			diffKeys[`${key}.${nestedKey}`] = nestedDiffKeys[nestedKey]!
		}
	}

	return Object.keys(diffKeys).length > 0 ? diffKeys : undefined
}

export function validateLocaleKeys(
	locale: string,
	referenceLocaleKeys: Record<string, any>,
	currentLocaleKeys: Record<string, any>,
): Record<string, any>
{
	const diff = diffLocaleKeys(referenceLocaleKeys, currentLocaleKeys)
	if (diff)
	{
		console.warn(`Failed to validate "${locale}" locale keys:`, diff)
	}

	return currentLocaleKeys
}
