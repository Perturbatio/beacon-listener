beacon-listener
===============

Beacon Listener - Create one or more listeners to watch for nodes with specified selectors to enter either the viewport or a specified region

Basic usage:
```javascript
(function(){
	
	//listen for all elements with a class of 'beacon' in the viewport
	var myListener = new BeaconListener({
		beacons: '.beacon'
	});
	
	myListener.addEventListener('beacon-listener:found', function(e){
		e.beacon.show(true);
	});
	
	myListener.addEventListener('beacon-listener:lost', function(e){
		e.beacon.hide(true);
	});
	
})();
````

Advanced usage:

```javascript
(function(){
	
		// listen for all elements with a class of 'beacon'
		// but only if they are fully inside the region defined by #my-region
		var myListener = new BeaconListener({
			beacons: '.beacon',
			region: '#my-region',
			fullyInside: true,
			pollInterval: 200
		});
	
		myListener.addEventListener('beacon-listener:found', function(e){
			e.beacon.show(true);
		});
	
		myListener.addEventListener('beacon-listener:lost', function(e){
			e.beacon.hide(true);
		});
})();
````

Lazy loading images:

```javascript
(function(){
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
````