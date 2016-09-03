/**
 * Created by kris on 03/09/16.
 */
(function () {
	var listener = new BeaconListener({
		beacons     : '.beacon',
		region      : '#test-zone',
		//fullyInside : true,
		pollInterval: 200
	});

	listener.start();

	document.addEventListener('beacon-listener:found', function(e){
		console.log(e, 'found');
	});

	document.addEventListener('beacon-listener:lost', function(e){
		console.log(e, 'lost');
	});

	//
	//var zone = document.querySelector('#test-zone');
	//
	//function updateInfo(){
	//	window.requestAnimationFrame(function () {
	//
	//		zone.innerHTML = (BeaconListener.getNodeXY(zone));
	//	});
	//}
	//
	//window.addEventListener('scroll', updateInfo);
	//window.addEventListener('resize', updateInfo);

})();