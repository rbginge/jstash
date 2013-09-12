/*
 *	jStash.js v0.1
 *	Simple key store caching mechanism for Javascript with reg expression lookup support
 *
 *	Copyright 2013, Ryan Bolton:
 *	<ryan at ryanbolton dot me>
 *	jStash is available under the MIT license.
 */
 ;(function(window, library) {
 	'use strict';

	window[library] = (function() {

		// Generic helpers
		var messages = {
			error: {
				type: {
					itemSelector: 'A ' + library + ' lookup key should be of type String or RegExp',
					itemSetter: 'A ' + library + ' key should be of type String'
				}
			}
		},
		isStr = function(str) {
			return typeof str === 'string' || str instanceof String;
		},
		iterateBackwards = function(arr, cb) {
			for(var iLen = arr.length, i = (iLen - 1); i >= 0; i--) {
				cb(arr[i], i);
			}
		},
		iterateObj = function(obj, cb) {
			for(var key in obj) {
				if(obj.hasOwnProperty(key)) {
					cb(obj[key], key);
				}
			};
		},
		TypeException = function(message) {
			this.message = message;
			this.name = "TypeException";
		},
		purge = function(obj) {
			iterateObj(obj, function(val, key) {
				if(obj.hasOwnProperty(key)) {
					delete obj.key;
				}
			});
		},
		convertToRegExp = function(regExpStr) {
			var regExpMatch = regExpStr.match(/^\/(.+)\/(\w*)/);
			
			if(regExpMatch) return new RegExp(regExpMatch[1],regExpMatch[2]);

			return new RegExp(".*","gi");
		};

		// jStash helpers
		var isValidSelector = function(selector) {
			return isStr(selector) || (selector instanceof RegExp);
		}, getItemIndexes = function(keyPattern) {
			var that = this;

			return this.cache.keys.filter(function(key, index, array) {
				return (isStr(keyPattern) && keyPattern === key) || 
					(keyPattern instanceof RegExp && key.match(keyPattern));
			}).map(function(key, index) {
				return findItemIndex.call(that, key);
			});
		},
		findItemIndex = function(key) {
			return this.cache['keys'].indexOf(key);
		},
		removeItemAtIndex = function(index) {
			this.cache.keys.splice(index, 1);
			this.cache.values.splice(index, 1);
			this.cache.expires.splice(index, 1);
		};

		// jStash class
		var jStash = function() {
			this.cache = {
				keys: [],
			 	values: [],
			 	expires: []
			};
		};

		jStash.prototype = {
			get: function(key) {
				var that = this, itemIndexes, items;

				if(key && !isValidSelector(key)) {
					throw new TypeException(messages.error.type.itemSelector);
				}

				if(key) {
					itemIndexes = getItemIndexes.call(this, key);

					items = itemIndexes.map(function(index) {
						return that.cache.values[index];
					});

					return items.length === 0 ? null : items.length === 1 ? items[0] : items; 
				}

				return this.cache.values.length === 0 ? null : this.cache.values.length === 1 ? this.cache.values[0] : this.cache.values; 
			},
			set: function(key, value, options) {
				var that = this, itemIndex,
					expireItem = (function(k, o) {
						return function() {
							removeItemAtIndex.call(that, findItemIndex.call(that, k));
							if(o.callback) o.callback();
						};
					}) (key, options);

				if(!isStr(key)) {
					throw new TypeException(messages.error.type.itemSetter);
				}

				itemIndex = findItemIndex.call(this, key);

				if(itemIndex > -1) {
					if(this.cache.expires[itemIndex]) {
						clearTimeout(this.cache.expires[itemIndex]);
					}

					this.cache.values[itemIndex] = value;
					this.cache.expires[itemIndex] = options && options.expires ? setTimeout(expireItem, options.expires * 1000) : false;

					return;
				}

				this.cache.keys.push(key);
				this.cache.values.push(value);
				this.cache.expires.push(options && options.expires ? setTimeout(expireItem, options.expires * 1000) : false);
			},
			remove: function(key) {
				var that = this, itemIndexes;

				if(key && !isValidSelector(key)) {
					throw new TypeException(messages.error.type.itemSelector);
				}

				if(key) {
					itemIndexes = getItemIndexes.call(this, key);

					iterateBackwards(itemIndexes, function(itemIndex) {
						if(that.cache.expires[itemIndex]) {
							clearTimeout(that.cache.expires[itemIndex]);
						}
						removeItemAtIndex.call(that, itemIndex);
					});

					return;
				}

				this.cache.keys.length = this.cache.values.length = this.cache.expires.length = 0;
			}
		};

		return jStash;

	}) ();
})(window, 'jStash');
