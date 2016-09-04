/**
 * Created by kris on 03/09/16.
 */
(function () {
	var basicListener = new BeaconListener({
		beacons     : '.beacon',
		region      : '#test-zone',//removing the region will cause the viewport to be used instead
		fullyInside : false,//setting to true will require that the beacon is fully inside the region
		pollInterval: 1000 / 60
	}),
	testZone = document.querySelector('#test-zone');

	basicListener.start();

	basicListener.addEventListener('beacon-listener:found', function(e){
		testZone.classList.add('found');
		console.log('found using fixedListener');
	});

	basicListener.addEventListener('beacon-listener:lost', function(e){
		testZone.classList.remove('found');
		console.log('lost using fixedListener');

	});
})();