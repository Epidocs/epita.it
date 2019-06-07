$(document).ready(function() {
	// Get current URL path and assign 'active' class
	var pathname = window.location.pathname;
	var $link = $('#navbar a[href="' + pathname + '"]');
	$link.addClass('btn-primary').removeClass('btn-secondary');
});