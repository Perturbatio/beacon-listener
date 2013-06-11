/**
 * TODO: check that the example works (on the fly writing)
 * @example 
 * var picListener = new Y.BeaconListener({beacons:'.pic-beacon'});//listen for all in viewport
 *	picListener.on('found', function(e){
 *	e.beacon.src = e.beacon.getData('img-src');
 *	
 *	new Y.Anim({
 *		node:e.beacon,
 *		from: {
 *			opacity: 0
 *		},
 *		to: {
 *			opacity: 1
 *		}
 *	}).run();
 * });
 * 
 * @author Kris Kelly
 * @description Beacon listeners are simple classes that will periodically 
 * check for an element or elements within their defined region
 */
YUI.add('beacon-listener', function(Y) {

	var MIN_TIMER_VAL = 1,
		EVENT_TYPE_FOUND = 'beaconlistener:found',
		EVENT_TYPE_LOST = 'beaconlistener:lost',
		Lang = Y.Lang,
		DOM = Y.DOM,
		TOP = 'top',
		RIGHT = 'right',
		BOTTOM = 'bottom',
		LEFT = 'left';


	Y.BeaconListener = Y.Base.create('beaconlistener', Y.Base, [], {
		_isListening: false,
		_timerHandle: null,
		_pollInterval: 100,
		_region: null,//a cache of the region for this listener
		_beaconList: null,
		_beaconStates: [],
		_beaconDOMNodes: [],
		_fullyInside: false,

		/**
		 *
		 *****************/
		initializer: function(config){
			var me = this, 
				beacons = config.beacons, 
				region = config.region;
		
			me.publish(EVENT_TYPE_FOUND, {
				context: me,
				broadcast: true,
				emitFacade: true
			});

			me.publish(EVENT_TYPE_LOST, {
				context: me,
				broadcast: true,
				emitFacade: true
			});

			//LISTEN TO
			me.after('beaconlistener:beaconsChange', me._handleBeaconsChange);
			if ( beacons ){
				me._handleBeaconsChange();
			}
			//REGION
			me.after('beaconlistener:regionChange', me._handleRegionChange);
			if ( region ){
				me._handleRegionChange();
			}
			
			//poll interval
			me.after('beaconlistener:pollIntervalChange', me._handlePollIntervalChange);

			Y.on('windowresize', function(){ me._handleRegionChange();  });
			
			me.after('beaconlistener:fullyInsideChange', me._handleFullyInsideChange);
			
			me._handleFullyInsideChange();//force setting of internal property
			
			
			//fire off a check now
			Y.later(
					me.get('pollInterval'), 
					me, 
					me.check, 
					null,
					false
				);
		},

		/**
		 *
		 *****************/
		stop: function(){
			var me = this;
			if (me._isListening === true && me._timerHandle !== null){
				me._timerHandle.cancel();
				me._timerHandle = null;
				me._isListening = false;
			}
		},

		/**
		 *
		 *****************/
		start: function(){
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
		},

		/**
		 *
		 *****************/
		check: function(){
			var me = this,
				region = me._region,
				testMethod;
			
			if (region === null){
				testMethod = DOM.inViewportRegion;
			} else {
				me._handleRegionChange();//since the scroll pos can change the region
				region = me._region;
				testMethod = DOM.inRegion;
			}

			me._beaconList.each(function(node, index, nodeList){
				var testNode = me._beaconDOMNodes[index], inRegion, args;

				if (region === null){
					args = [testNode, me._fullyInside];
				} else {
					args = [testNode, region, me._fullyInside];
				}
				
				inRegion = testMethod.apply(me, args);
				
				if ( inRegion && !me._beaconStates[index] ){
					//if we encounter a beacon and it wasn't previously in the region
					me._beaconStates[index] = true;
					me.fire( EVENT_TYPE_FOUND, {listener: me, beacon: node} );

				} else if ( !inRegion && me._beaconStates[index]){
					//if we encounter a beacon and it was in the region
					me._beaconStates[index] = false;
					me.fire( EVENT_TYPE_LOST, {listener: me, beacon: node} );
				}
			});
		},

		/**
		 * 
		 **********************/
		isListening: function(){
			return this._isListening;
		},
		
		/**
		 * 
		 **********************/
		_handleFullyInsideChange: function(){
			var me = this;
			//store the fullyInside property internally
			me._fullyInside = me.get('fullyInside');
		},
		
		/**
		 *
		 *****************/
		_handleRegionChange: function(e){
			var me = this,
				region = me.get('region');
			me._recalcRegion(region);
		},

		/**
		 *
		 *****************/
		_recalcRegion: function(region){
			var me = this, newRegion;
			
			if ( Lang.isObject( region ) ){
				if (
					Lang.isNumber( region[TOP] ) 
					&& Lang.isNumber( region[RIGHT] )
					&& Lang.isNumber( region[BOTTOM] )
					&& Lang.isNumber( region[LEFT] )
				) {
					me._region = region;
					return;
				} else {
					region = Y.one( region );

					if ( region ){
						if (region.getDOMNode){
							newRegion = DOM.region(region.getDOMNode());
						} else {
							newRegion = DOM.region(region);
						}

						if (newRegion){
							me._region = newRegion;
							return;
						}
					}
				}
			}
			//defult to the viewport
			me._region = null;
		},

		/**
		 *
		 *****************/
		_handleBeaconsChange: function(e){
			var me = this,
				beacons = me.get('beacons');
			
			me._beaconStates = [];
			me._beaconDOMNodes = [];
			me._beaconList = me._getList(beacons);
			
			if ( me._beaconList && me._beaconList.size() > 0 ){
				me._beaconList.each(function(node, index, nodeList){
					me._beaconStates[index] = false;
					me._beaconDOMNodes[index] = node.getDOMNode();
				});
			}

		},

		/**
		 * @return NodeList|null
		 *****************/
		_getList: function(val){
			var me = this,
				temp;

			if ( Lang.isString( val ) ){ //assume it's a selector
				return Y.all(val);
			}

			if ( Lang.isObject( val ) && val.nodes ) {//if it's a nodelist
				return val;
			}

			temp = Y.one( val );
			if (temp){
				return new Y.NodeList(temp);
			}
			return null;
		},

		/**
		 *
		 *****************/
		_handlePollIntervalChange: function(e){
			var me = this;
			me._pollInterval = me.get('pollInterval');
		}
	}, {
		ATTRS: {
			"pollInterval": {
				value:100,
				validator: function( val, name ){
					return ( Lang.isNumber(val) && val > MIN_TIMER_VAL );
				}
			},
			"region": { //can be a node or region object
				value: null, //if region is null then the viewport will be used
				validator: function(val, name){
					return ( val === null || Y.one( val ) );
				}
			},
			"beacons": {
				value: '.beacon',
				validator: function(val, name){
					return (!Lang.isUndefined(val) && val !== null);
				}
			},
			"fullyInside": {
				value:false,
				validator: function( val, name ){
					return Lang.isBoolean(val);
				}
			}
		}
	});
}, '1.0', {requires:['node',"event-custom", "event-resize", 'base-build', 'dom']});
