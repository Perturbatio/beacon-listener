const TOP = 'top';
const RIGHT = 'right';
const BOTTOM = 'bottom';
const LEFT = 'left';
const EVENT_TYPE_BEACON_FOUND = 'beacon-listener:found';
const EVENT_TYPE_BEACON_LOST = 'beacon-listener:lost';
/**
 *
 */
class BeaconListener {

	get events() {
		return me._events;
	}

	constructor( config ) {

		var me = this,
			staticClass = BeaconListener,
			beacons,
			region;

		config = config || {
				beacons  : '.beacon',
				region   : null,
				autoStart: false
			};
		me._config = config;
		me._MIN_TIMER_VAL = 1;

		me._isListening = false;
		me._timerHandle = null;
		me._pollInterval = config['pollInterval'] = 100;
		me._region = null;//a cache of the region for this listener
		me._beaconList = null;
		me._beaconStates = [];
		me._beaconDOMNodes = [];
		me._fullyInside = false;
		me.listeners = [];


		beacons = config.beacons;
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
		//LISTEN TO
		//me.after('beaconlistener:beaconsChange', me._handleBeaconsChange);

		if ( beacons ) {
			me._handleBeaconsChange();
		}

		//REGION
		//me.after('beaconlistener:regionChange', me._handleRegionChange);

		if ( region ) {
			me._handleRegionChange();
		}


		//
		// //poll interval
		// me.after('beaconlistener:pollIntervalChange', me._handlePollIntervalChange);
		//
		// Y.on('windowresize', function(){ me._handleRegionChange();  });
		//
		// me.after('beaconlistener:fullyInsideChange', me._handleFullyInsideChange);

		me._handleFullyInsideChange();//force setting of internal property

		if ( me.getConfig('autoStart') ) {
			me.start();
			//fire off a check now
			staticClass.later(
				me.getConfig('pollInterval'),
				me,
				me.check,
				null,
				false
			);
		}

		window.addEventListener('scroll', () => me._handleRegionChange);
		window.addEventListener('resize', () => me._handleRegionChange);
		me.check();
	}

	/**
	 * Stop listening for beacons
	 *
	 * @method stop
	 *****************/
	stop() {
		var me = this;
		if ( me._isListening === true && me._timerHandle !== null ) {
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
	start() {
		var me = this,
			staticClass = BeaconListener;
		if (
			staticClass.isUndefined(me._timerHandler)
			&& !staticClass.isUndefined(me._beaconList)
			&& me._beaconList !== null
		) {
			me._isListening = true;
			
			me._timerHandle = staticClass.later(
				me.getConfig('pollInterval'),
				me,
				me.check,
				null,
				true
			);
		}
	}

	/**
	 *
	 * @param node
	 * @param fullyInside
	 * @param altRegion
	 * @returns {Boolean}
	 */
	inViewportRegion( node, fullyInside, altRegion ) {
		return this.inRegion(node, BeaconListener.viewportRegion(), fullyInside, altRegion)
	}

	/**
	 *
	 * @param node
	 * @param node2
	 * @param fullyInside
	 * @param altRegion
	 * @returns {Boolean}
	 */
	inRegion( node, node2, fullyInside, altRegion ) {
		var region = {},
			staticClass = BeaconListener,
			r = altRegion || staticClass.getNodeRegion(node),
			n = node2,
			off;

		if ( n.tagName ) {
			region = staticClass.getNodeRegion(n);
		} else if ( staticClass.isObject(node2) ) {
			region = node2;
		} else {
			return false;
		}

		if ( fullyInside ) {
			return (
			r[LEFT] >= region[LEFT] &&
			r[RIGHT] <= region[RIGHT] &&
			r[TOP] >= region[TOP] &&
			r[BOTTOM] <= region[BOTTOM]  );
		} else {
			off = staticClass.getOffsets(region, r);
			return ( off[BOTTOM] >= off[TOP] && off[RIGHT] >= off[LEFT] );
		}
	}

	static getOffsets( r1, r2 ) {
		var result = {};

		result[TOP] = Math.max(r1[TOP], r2[TOP]);
		result[RIGHT] = Math.min(r1[RIGHT], r2[RIGHT]);
		result[BOTTOM] = Math.min(r1[BOTTOM], r2[BOTTOM]);
		result[LEFT] = Math.max(r1[LEFT], r2[LEFT]);
		return result;
	}

	/**
	 * Check for beacons in the region
	 *
	 * @method check
	 *****************/
	check() {
		var me = this,
			region = me._region,
			staticClass = BeaconListener,
			testMethod;

		if ( region === null ) {
			testMethod = me.inViewportRegion; //ex DOM
		} else {
			me._handleRegionChange();//since the scroll pos can change the region
			region = me._region;
			testMethod = me.inRegion;
		}

		[].forEach.call(me._beaconList, function ( node, index ) {
			var testNode = me._beaconDOMNodes[index], inRegion, args;

			if ( region === null ) {
				args = [testNode, me._fullyInside];
			} else {
				args = [testNode, region, me._fullyInside];
			}

			inRegion = testMethod.apply(me, args);

			if ( inRegion && me._beaconStates[index] !== true ) {
				//if we encounter a beacon and it wasn't previously in the region
				me._beaconStates[index] = true;

				me.fireEvent(EVENT_TYPE_BEACON_FOUND, {listener: me, beacon: node}, me);

			} else if ( !inRegion && me._beaconStates[index] === true ) {
				//if we encounter a beacon and it was in the region
				me._beaconStates[index] = false;

				me.fireEvent(EVENT_TYPE_BEACON_LOST, {listener: me, beacon: node}, me);
			}
		});
	}

	/**
	 *
	 * @param type
	 * @param data
	 * @param dispatcher
	 */
	fireEvent( type, data, dispatcher ) {
		dispatcher = dispatcher || document;
		var event = new CustomEvent(type, {detail: data, target: this});
		dispatcher.dispatchEvent(event);
	}

	addEventListener ( type, callback ) {
		if ( !(type in this.listeners) ) {
			this.listeners[type] = [];
		}
		this.listeners[type].push(callback);
	}

	removeEventListener ( type, callback ) {
		if ( !(type in this.listeners) ) {
			return;
		}
		var stack = this.listeners[type];
		for ( var i = 0, l = stack.length; i < l; i++ ) {
			if ( stack[i] === callback ) {
				stack.splice(i, 1);
				return this.removeEventListener(type, callback);
			}
		}
	}

	dispatchEvent( event ) {
		if ( !(event.type in this.listeners) ) {
			return;
		}
		var stack = this.listeners[event.type];
		//event.target = this;
		for ( var i = 0, l = stack.length; i < l; i++ ) {
			stack[i].call(this, event);
		}
		document.dispatchEvent(event);
	}

	/**
	 * a clone of YUI3 Y.later
	 *
	 * @param when
	 * @param obj
	 * @param fn
	 * @param data
	 * @param periodic
	 * @returns {{id: number, interval: *, cancel: cancel}}
	 */
	static later( when, obj, fn, data, periodic ) {
		var emptyArray = [],
			staticClass = BeaconListener;

		when = when || 0;

		if ( !staticClass.isUndefined(data) && data ) {
			data = (!staticClass.isUndefined(data)) ? (Array.isArray(data)) ? data : (data.hasOwnProperty("slice")) ? Array.from(data) : emptyArray : emptyArray;
		} else {
			data = emptyArray;
		}

		obj = obj || window;

		var cancelled = false,
			method = (obj && staticClass.isString(fn)) ? obj[fn] : fn,
			wrapper = function () {
				// IE 8- may execute a setInterval callback one last time
				// after clearInterval was called, so in order to preserve
				// the cancel() === no more runny-run, we have to jump through
				// an extra hoop.
				if ( !cancelled ) {
					if ( !method.apply ) {
						method(data[0], data[1], data[2], data[3]);
					} else {
						method.apply(obj, data || emptyArray);
					}
				}
			},
			id = (periodic) ? setInterval(wrapper, when) : setTimeout(wrapper, when);

		return {
			id      : id,
			interval: periodic,
			cancel  : function () {
				cancelled = true;
				if ( this.interval ) {
					clearInterval(id);
				} else {
					clearTimeout(id);
				}
			}
		};
	}

	/**
	 * test if a variable is undefined
	 *
	 * @param value
	 * @returns {boolean}
	 */
	static isUndefined( value ) {
		return typeof value === 'undefined';
	}

	/**
	 * test if a variable is a string
	 * @param value
	 * @returns {boolean}
	 */
	static isString( value ) {
		return typeof value === 'string';
	}

	/**
	 *
	 * @param obj
	 * @returns {*|boolean}
	 */
	static isObject( obj ) {
		var varType = typeof obj,
			staticClass = BeaconListener;
		return (obj
				&& (
					varType === 'object'
					|| (
						varType === 'function'
						|| staticClass.isFunction(obj)
					)
				)
			)
			|| false;
	}

	/**
	 *
	 * @param o
	 * @returns {boolean}
	 */
	static isFunction( o ) {
		return typeof o === 'function';
	}

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	static isNumber( value ) {
		return typeof value === 'number' && isFinite(value);
	}

	/**
	 *
	 * @param node
	 * @returns {boolean}
	 */
	static getNodeXY( node ) {

		var win = window,
			winXY,
			nodeXY = false,
			nodeRect;

		if ( node && win ) {
			winXY = [win.pageXOffset, win.pageYOffset];
			nodeRect = node.getBoundingClientRect();
			nodeXY = [winXY[0] + nodeRect.left, winXY[1] + nodeRect.top];
		}
		return nodeXY;
	}

	/**
	 * Get a setting from the config object
	 *
	 * @param configItem
	 * @returns {*}
	 */
	getConfig( configItem ) {
		if ( this._config.hasOwnProperty(configItem) ) {
			return this._config[configItem];
		}
		return null
	}

	/**
	 * Check if the listener is listening
	 *
	 * @method isListening
	 **********************/
	isListening() {
		return this._isListening;
	}

	/**
	 * @private
	 * @method _handleFullyInsideChange
	 **********************/
	_handleFullyInsideChange() {
		var me = this;
		//store the fullyInside property internally
		me._fullyInside = me.getConfig('fullyInside');
	}

	/**
	 * @private
	 * @method _handleRegionChange
	 *****************/
	_handleRegionChange() {
		var me = this,
			region = me.getConfig('region');

		window.requestAnimationFrame(function () {
			me.recalcRegion(region);
		});
	}

	/**
	 * @protected
	 * @method _handleBeaconsChange
	 *****************/
	_handleBeaconsChange() {
		var me = this,
			staticClass = BeaconListener,
			beacons = me.getConfig('beacons');

		me._beaconDOMNodes = [];
		me._beaconList = staticClass._getList(beacons);
		me._beaconStates = [].fill(false, me._beaconList.length);

		if ( me._beaconList && me._beaconList.length > 0 ) {
			[].forEach.call(me._beaconList, function ( node, index ) {
				me._beaconStates[index] = false;
				me._beaconDOMNodes[index] = node;
			});
		}

	}

	/**
	 *
	 * @param val
	 * @returns {NodeList}
	 * @private
	 */
	static _getList( val ) {
		return document.querySelectorAll(val);
	}


	/**
	 *
	 * Recalculate the region
	 * The the region is a valid object then the current region will be overwritten
	 *
	 * @param region (optional)
	 * @method recalcRegion
	 */
	recalcRegion( region ) {
		var me = this,
			newRegion,
			staticClass = BeaconListener;

		if ( staticClass.isUndefined(region) ) {
			region = me._region;
		}

		if ( staticClass.isObject(region) && (
				staticClass.isNumber(region[TOP])
				&& staticClass.isNumber(region[RIGHT])
				&& staticClass.isNumber(region[BOTTOM])
				&& staticClass.isNumber(region[LEFT])
			) ) {
			me._region = region;
			return;
		} else {
			region = document.querySelector(region);

			if ( region ) {
				newRegion = staticClass.getNodeRegion(region);

				if ( newRegion ) {
					me._region = newRegion;
					return;
				}
			}
		}

		//default to the viewport
		me._region = null;
	}

	/**
	 *
	 * @param node
	 * @returns {boolean}
	 */
	static viewportRegion( node ) {
		node = node || document.body.parentNode;
		var result = false,
			scrollX,
			scrollY,
			staticClass = BeaconListener;

		if ( node ) {
			scrollX = node.offsetLeft;
			scrollY = node.offsetTop;

			result = staticClass._getRegion(scrollY, // top
				staticClass.winWidth(node) + scrollX, // right
				scrollY + staticClass.winHeight(node), // bottom
				scrollX); // left
		}

		return result;
	}

	/**
	 *
	 * @param top
	 * @param right
	 * @param bottom
	 * @param left
	 * @returns {{}}
	 * @private
	 */
	static _getRegion( top, right, bottom, left ) {

		var region = {};

		region[TOP] = region[1] = top;
		region[LEFT] = region[0] = left;
		region[BOTTOM] = bottom;
		region[RIGHT] = right;
		region.width = region[RIGHT] - region[LEFT];
		region.height = region[BOTTOM] - region[TOP];

		return region;

	}


	/**
	 *
	 * @param node
	 */
	static getNodeRegion( node ) {
		var rect,
			result = false;

		if ( node ) {
			rect = node.getBoundingClientRect();
			return BeaconListener._getRegion(rect.top, rect.right, rect.bottom, rect.left);
		}
		return result;
	}

	static _getWinSize( node, doc ) {
		doc = doc || document;
		var win = doc.defaultView || doc.parentWindow,
			mode = doc.compatMode,
			h = win.innerHeight,
			w = win.innerWidth,
			root = doc.documentElement;

		if ( mode ) {
			if ( mode != 'CSS1Compat' ) { // Quirks
				root = doc.body;
			}
			h = root.clientHeight;
			w = root.clientWidth;
		}
		return {height: h, width: w};
	}


	/**
	 * Returns the inner height of the viewport (exludes scrollbar).
	 * @method winHeight
	 * @return {Number} The current height of the viewport.
	 */
	static winHeight( node ) {
		return BeaconListener._getWinSize(node).height;
	}

	/**
	 * Returns the inner width of the viewport (exludes scrollbar).
	 * @method winWidth
	 * @return {Number} The current width of the viewport.
	 */
	static winWidth( node ) {
		return BeaconListener._getWinSize(node).width;
	}

	/**
	 * Document height
	 * @method docHeight
	 * @return {Number} The current height of the document.
	 */
	static docHeight( node ) {
		var staticClass = BeaconListener,
			h = staticClass._getDocSize(node).height;
		return Math.max(h, staticClass._getWinSize(node).height);
	}

	/**
	 * Document width
	 * @method docWidth
	 * @return {Number} The current width of the document.
	 */
	static docWidth( node ) {
		var staticClass = BeaconListener,
			w = staticClass._getDocSize(node).width;
		return Math.max(w, staticClass._getWinSize(node).width);
	}

	/**
	 *
	 * @returns {{height: number, width: number}}
	 * @private
	 */
	static _getDocSize() {
		var doc = doc || document,
			root = doc.documentElement;

		if ( doc.compatMode != 'CSS1Compat' ) {
			root = doc.body;
		}

		return {height: root.scrollHeight, width: root.scrollWidth};
	}

	/**
	 * The amount page has been scroll horizontally
	 *
	 * @param doc
	 * @returns {number} The current amount the screen is scrolled horizontally.
	 */
	static docScrollX( doc ) {
		var t;
		doc = doc || document;
		return (((t = doc.documentElement) || (t = doc.body.parentNode))
		&& typeof t.scrollLeft == 'number' ? t : doc.body).scrollLeft
	}

	/**
	 * The amount the page has been scrolled vertically
	 *
	 * @param doc
	 * @returns {number} The current amount the screen is scrolled vertically.
	 */
	static docScrollY( doc ) {
		var t;
		doc = doc || document;
		return (((t = doc.documentElement) || (t = doc.body.parentNode))
		&& typeof t.scrollTop == 'number' ? t : doc.body).scrollTop
	}

}