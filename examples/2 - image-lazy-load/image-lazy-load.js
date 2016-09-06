/**
 * Created by kris on 03/09/16.
 */
(function () {

	document.addEventListener("DOMContentLoaded", function ( event ) {
		var imageListener = new BeaconListener({
			beacons     : 'img[data-src]',
			fullyInside : false,
			pollInterval: 1000 / 60,
			autoStart   : true
		});

		imageListener.addEventListener('beacon-listener:found', function ( e ) {
			var img = e.detail.beacon,
				newSrc = img.getAttribute('data-src');

			if ( newSrc && newSrc.length > 0 ) {
				img.src = newSrc;
				img.removeAttribute('data-src');
			}
		});
	});
})();