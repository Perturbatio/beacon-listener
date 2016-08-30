/**
 *
 */
class BeaconListener {
	constructor(config){
		config = config || {
				beacons: '.beacon',
				region: null
			};
		this._MIN_TIMER_VAL = 1;
		this._EVENT_TYPE_FOUND = 'beacon-listener:found';
		this._EVENT_TYPE_LOST = 'beacon-listener:lost';
		this._TOP = 'top';
		this._RIGHT = 'right';
		this._BOTTOM = 'bottom';
		this._LEFT = 'left';

		this._isListening = false;
		this._timerHandle = null;
		this._pollInterval = config['pollInterval'] = 100;
		this._region = null;//a cache of the region for this listener
		this._beaconList = null;
		this._beaconStates = [];
		this._beaconDOMNodes = [];
		this._fullyInside = false;

		const me = this,
			beacons = config.beacons,
			region = config.region;
		//
		// me.publish(this._EVENT_TYPE_FOUND, {
		// 	context: me,
		// 	broadcast: true,
		// 	emitFacade: true
		// });
		//
		// me.publish(this._EVENT_TYPE_LOST, {
		// 	context: me,
		// 	broadcast: true,
		// 	emitFacade: true
		// });
		//
		// //LISTEN TO
		// me.after('beaconlistener:beaconsChange', me._handleBeaconsChange);
		// if ( beacons ){
		// 	me._handleBeaconsChange();
		// }
		// //REGION
		// me.after('beaconlistener:regionChange', me._handleRegionChange);
		// if ( region ){
		// 	me._handleRegionChange();
		// }
		//
		// //poll interval
		// me.after('beaconlistener:pollIntervalChange', me._handlePollIntervalChange);
		//
		// Y.on('windowresize', function(){ me._handleRegionChange();  });
		//
		// me.after('beaconlistener:fullyInsideChange', me._handleFullyInsideChange);
		//
		// me._handleFullyInsideChange();//force setting of internal property
		//
		// if (me.get('autoStart')){
		// 	me.start();
		// 	//fire off a check now
		// 	Y.later(
		// 		me.get('pollInterval'),
		// 		me,
		// 		me.check,
		// 		null,
		// 		false
		// 	);
		// }

	}

	/**
	 * Stop listening for beacons
	 *
	 * @method stop
	 *****************/
	stop(){
		var me = this;
		if (me._isListening === true && me._timerHandle !== null){
			me._timerHandle.cancel();
			me._timerHandle = null;
			me._isListening = false;
		}
	}

	/**
	 * Start listening for beacons
	 *
	 * @method start
	 *****************/
	start(){
		var me = this;
		if (
			Lang.isUndefined( me._timerHandler )
			&& !Lang.isUndefined( me._beaconList )
			&& me._beaconList !== null
		){
			me._isListening = true;
			me._timerHandle = Y.later(
				me.get('pollInterval'),
				me,
				me.check,
				null,
				true
			);
		}
	}

	/**
	 *
	 * @param value
	 */
	static isUndefined(value){

	}

}