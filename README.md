Simple key store caching mechanism for Javascript with support for reg expression lookup
========================================================================================

A key store caching tool written in Javascript with support for expiration of items (and subsequent callbacks) and regular expression item lookup.

Usage
------------

Creating a new stash
------------------------------------

```javascript
	var stash = new jStash();
```

Adding an item to the stash
------------------------------------

```javascript
	stash.set('key1', value);
```

Adding an item to the stash to expire after a number of seconds
---------------------------------------------------------------

```javascript
	stash.set('key1', value, {
		expires: 10 	// number of seconds until expiry
	});
```

Adding an item to the stash to expire and then subsequently execute a callback on expiry
-----------------------------------------------------------------------------------------

```javascript
	stash.set('key1', value, {
		expires: 10, 	// number of seconds until expiry
		callback: function() {
			console.log('Hello from the callback');
		}
	});
```

Retrieve an item from the stash
------------------------------------
Returns item value or null if key doesn't exist

```javascript
	var item1 = stash.get('key1');
```

Retrieve an item or items from the stash via a regular expression
------------------------------------------------------------
Returns the item or an array of items if more than one item exists where the key matches the regular expression or null if the expression doesn't match any keys

```javascript
	var items = stash.get(/^key/);
```

Remove an item from the stash
------------------------------------

```javascript
	stash.remove('key1');
```

Remove an item or items from the stash via a regular expression
------------------------------------------------------------

```javascript
	stash.remove(/^key/);
```
