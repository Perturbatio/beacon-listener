/**
 * Created by kris on 03/09/16.
 */
(function () {
	var fixedListener = new BeaconListener({
		beacons     : '.beacon',
		region      : '#test-zone',
		fullyInside : true,
		pollInterval: 1000 / 60
	}),
	viewportListener = new BeaconListener({
		beacons     : '.beacon',
		//fullyInside : true,
		pollInterval: 1000 / 60
	}),
	testZone = document.querySelector('#test-zone');

	fixedListener.start();

	fixedListener.addEventListener('beacon-listener:found', function(e){
		testZone.classList.add('found');
		console.log('found using fixedListener');

	});

	fixedListener.addEventListener('beacon-listener:lost', function(e){
		testZone.classList.remove('found');
		console.log('lost using fixedListener');

	});
	viewportListener.start();
	viewportListener.addEventListener('beacon-listener:found', function(e){
		console.log('found using viewportListener');
	});
	viewportListener.addEventListener('beacon-listener:lost', function(e){
		console.log('lost using viewportListener');
	});

	document.addEventListener('beacon-listener:found', function ( e ) {
		console.log('found using document');

	});
})();