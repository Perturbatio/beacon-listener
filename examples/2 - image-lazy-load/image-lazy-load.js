/**
 * Created by kris on 03/09/16.
 */
(function () {
	var imageListener = new BeaconListener({
		beacons     : 'img[data-src]',
		fullyInside : true,
		pollInterval: 1000 / 60,
		autoStart: true
	});

	imageListener.addEventListener('beacon-listener:found', function(e){
		var img  = e.detail.beacon,
			newSrc = img.getAttribute('data-src');

		if (newSrc && newSrc.length > 0){
			img.src = newSrc;
			img.removeAttribute('data-src');
		}
	});
})();