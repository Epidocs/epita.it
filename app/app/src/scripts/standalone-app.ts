function handleStandaloneApp()
{
	if (window.matchMedia('(display-mode: standalone)').matches)
	{
		// From the standalone web app

		// Open all external links in a new tab
		const externalLinks = document.querySelectorAll('a:is([href^="http://"], [href^="https://"], [href^="//"])')
		for (const externalLink of externalLinks)
		{
			externalLink.setAttribute('target', '_blank')
		}

		// Hide the standalone web app ad in the newsline carousel
		const newslineCarouselItem = document.getElementById('addToHomeScreen')
		if (newslineCarouselItem)
		{
			newslineCarouselItem.classList.remove('carousel-item')
			newslineCarouselItem.style.display = 'none'
		}
	}
}

document.addEventListener('DOMContentLoaded', handleStandaloneApp, false)
