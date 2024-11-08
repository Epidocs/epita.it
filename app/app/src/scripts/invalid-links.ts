function handleInvalidLinks()
{
	const invalidTileLinks = document.querySelectorAll('.tiles-grid a.invalid')
	for (const invalidTileLink of invalidTileLinks)
	{
		invalidTileLink.addEventListener('click', (event) =>
		{
			event.preventDefault()

			const brand = (event.currentTarget as HTMLAnchorElement).querySelector('.branding-bar')?.textContent || null
			const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href')
			const target = (event.currentTarget as HTMLAnchorElement).getAttribute('target')

			const brandElement = document.getElementById('warn-invalid-brand')
			if (brandElement) brandElement.textContent = brand || (href ? new URL(href).hostname : 'null')
			const hrefElement = document.getElementById('warn-invalid-href')
			if (hrefElement) hrefElement.textContent = href || 'null'
			const linkElement = document.getElementById('warn-invalid-link')
			if (linkElement && href) linkElement.setAttribute('href', href)
			if (linkElement && target) linkElement.setAttribute('target', target)
			const modalElement = document.getElementById('warn-invalid-modal')
			if (modalElement) modalElement.classList.add('show')
		})
	}
}

document.addEventListener('DOMContentLoaded', handleInvalidLinks, false)
