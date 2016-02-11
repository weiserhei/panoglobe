/**
 * URL-Parameters
 */
define([], function () {

	var get_params = function(search_string) {

		var parse = function(params, pairs) {
			var pair = pairs[0];
			var parts = pair.split('=');
			var key = decodeURIComponent(parts[0]);
			var value = decodeURIComponent(parts.slice(1).join('='));

			// Handle multiple parameters of the same name
			if (typeof params[key] === "undefined") {
				params[key] = value;
			} else {
				params[key] = [].concat(params[key], value);
			}

			return pairs.length == 1 ? params : parse(params, pairs.slice(1))
		}

		// Get rid of leading ?
		return search_string.length == 0 ? {} : parse({}, search_string.substr(1).split('&'));
	}

	var params = get_params(location.search);

    return params;
});