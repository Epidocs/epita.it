$(document).ready(function() {
	// Get current URL path and assign 'active' class
	var pathname = window.location.pathname;
	var $link = $('#navbar a[href="' + pathname + '"]');
	$link.addClass('btn-primary').removeClass('btn-secondary');
	
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
});