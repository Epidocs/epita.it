$(document).ready(function() {
	// Get current URL path and assign 'active' class
	var pathname = window.location.pathname;
	var $link = $('#navbar .navbar-nav a[href="' + pathname + '"]');
	$link.addClass('active');
	if($link.hasClass('dropdown-item'))
		$link.parents('.nav-item').find('.nav-link').addClass('active');
	
	// Activate newsline carousel
	// $('#newsline').carousel(); // Carousel from Bootstrap is glitched
	var carouselInterval = 10000; // ms
	setInterval(function() {
		$current = $('#newsline .carousel-item.active');
		$current.removeClass('active');
		$next = $current.nextAll('.carousel-item').first();
		if($next.length <= 0) $next = $('.carousel-item').first();
		$next.addClass('active');
	}, carouselInterval);
	
	// Handle display behavior on small screens
	var checkScreenSize = function() {
		var $main = $('#main');
		var $tiles = $('#main .tiles-grid');
		
		// $main.width() = $tiles.width() + 30px
		if($main.width() < 500) {
			$main.addClass('smallscreen');
			
			if($main.width() < 340)
				$tiles.css('max-width', '150px');
			else
				$tiles.css('max-width', '310px');
		}
		else {
			$main.removeClass('smallscreen');
			$tiles.css('max-width', ''); // Remove CSS property
		}
	};
	checkScreenSize(); // Execute once after script load
	$(window).resize(checkScreenSize);
	
	// jQuery addon for selecting external links
	$.expr[':'].external = function(a) {
		var regex = /^(\w+:)?\/\//;
		var href = $(a).attr('href');
		return href !== undefined && href.search(regex) !== -1;
	};
	
	// Handle Tiles Grid link events for Analytics
	$('.tiles-grid').on('click', 'a:external', function() {
		gtag('event', 'click', {
			event_category: 'Outbound Link',
			event_label: $(this).find('.branding-bar').text(),
			transport_type: 'beacon'
		});
	});
	
	// Handle other External link events for Analytics
	$('body').on('click', 'a:external', function(e) {
		// Check that the element in not in the tiles grid
		if($(this).not($('.tiles-grid a')).length) {
			gtag('event', 'click', {
				event_category: 'External Link',
				event_label: $(this).attr('href'),
				transport_type: 'beacon'
			});
		}
	});
	
	// Open all external links in a new tab (from the web app)
	if (window.matchMedia('(display-mode: standalone)').matches) {
		$('a:external').attr('target', '_blank');
	}
	
	// Display ad about the web app in the newsline carousel
	else {
		$('#addToHomeScreen').addClass('carousel-item').removeClass('d-none');
	}
});
