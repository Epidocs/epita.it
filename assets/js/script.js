$(document).ready(function() {
	// Get current URL path and assign 'active' class
	var pathname = window.location.pathname;
	var $link = $('#navbar .navbar-nav a[href="' + pathname + '"]');
	$link.addClass('active');
	
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
	
	// Handle Outbound link events for Analytics
	$('.tiles-grid').on('click', 'a', function() {
		// Check if link is not relative
		if($(this).attr('href')[0] != '/') {
			gtag('event', 'click', {
				event_category: 'Outbound Link',
				event_label: $(this).find('.branding-bar').text(),
				transport_type: 'beacon'
			});
		}
	});
});
