function getScrollbarWidth()
{
	const elt = document.createElement('div')
	elt.style.position = 'absolute'
	elt.style.top = '-9999px'
	elt.style.width = '50px'
	elt.style.height = '50px'
	elt.style.overflow = 'scroll'
	document.body.appendChild(elt)
	const scrollbarWidth = elt.getBoundingClientRect().width - elt.clientWidth
	document.body.removeChild(elt)
	return scrollbarWidth
}

function checkBodyHeight()
{
	document.body.classList.toggle('has-scrollbar', document.documentElement.scrollHeight > window.innerHeight)
	document.body.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`)
}

document.addEventListener('DOMContentLoaded', checkBodyHeight, false)
window.addEventListener('resize', checkBodyHeight, false)
