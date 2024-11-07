function handleCarousel()
{
	// Handle Newsline carousel
	const carouselItems = document.querySelectorAll('#newsline .carousel-item')

	if (carouselItems.length <= 0)
	{
		// No carousel items
		return
	}

	for (const carouselItem of carouselItems)
	{
		carouselItem.classList.remove('active')
	}

	const randomCarouselItem = carouselItems[Math.floor(Math.random() * carouselItems.length)]
	randomCarouselItem?.classList.add('active')

	setInterval(
		() =>
		{
			let nextItem: Element | null = null
			const activeItems = document.querySelectorAll('#newsline .carousel-item.active')
			for (const activeItem of activeItems)
			{
				activeItem.classList.remove('active')
				nextItem = activeItem.nextElementSibling
			}

			if (!nextItem)
			{
				nextItem = carouselItems[0]!
			}

			nextItem.classList.add('active')
		},
		10000, // Interval in ms
	)
}

document.addEventListener('DOMContentLoaded', handleCarousel, false)
