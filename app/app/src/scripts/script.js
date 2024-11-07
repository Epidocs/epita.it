$(document).ready(function() {
	// // jQuery addon for selecting external links
	// $.expr[':'].external = function(a) {
	// 	var regex = /^(\w+:)?\/\//;
	// 	var href = $(a).attr('href');
	// 	return href !== undefined && href.search(regex) !== -1;
	// };

	// // Handle Tiles Grid link events for Analytics
	// $('.tiles-grid').on('click', 'a:external', function() {
	// 	if ($(this).hasClass('invalid'))
	// 		return; // Ignore clicks on invalid links

	// 	gtag('event', 'click', {
	// 		event_category: 'Outbound Link',
	// 		event_label: $(this).find('.branding-bar').text(),
	// 		transport_type: 'beacon'
	// 	});
	// });

	// // Handle other External link events for Analytics
	// $('body').on('click', 'a:external', function() {
	// 	// Check that the element in not in the tiles grid
	// 	if($(this).not($('.tiles-grid a')).length) {
	// 		gtag('event', 'click', {
	// 			event_category: 'External Link',
	// 			event_label: $(this).attr('href'),
	// 			transport_type: 'beacon'
	// 		});
	// 	}
	// });
});
