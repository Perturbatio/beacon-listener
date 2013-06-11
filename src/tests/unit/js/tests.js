YUI.add('beacon-listener-tests', function(Y) {

    var suite = new Y.Test.Suite('beacon-listener'),
    BeaconListener = Y.BeaconListener;

    suite.add(new Y.Test.Case({
        name: 'Automated Tests',
        setUp: function(){
        	this.listener = new BeaconListener();
        },
        takeDown: function(){
        	delete this.listener;
        },
        testIsNotListening: function() {
        	var listener = new BeaconListener({
        		beacons: '.beacon'
        	});
        	
            Y.Assert.isBoolean(listener.isListening() === false);
        }
    }));

    Y.Test.Runner.add(suite);


},'@VERSION@', { requires: [ 'test', 'beacon-listener' ] });
