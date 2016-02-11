/**
 * Route Loader
 */

define(["three","jquery","putils","urlParameters"], function (THREE, $, PANOUTILS, params) {

	function RouteLoader( callback ) {
	
		this.callback = callback;
	
	}
	
	RouteLoader.prototype.load = function ( url, name, phase, heightData ) {
	
		var radius = 100;
		
		var name = name || "";
		var phase = phase || 0;

		var that = this;

		// load datalist
		// get country names for POIs from google
		// execute Callback to create Route
		if ( url ) {			

			$.getJSON( url, {
				format: "json"
			})
			.done(function( data ) {
				
				var routeData = PANOUTILS.calc3DPositions( data, heightData, radius );
				
				console.log( "Route has been loaded" );
				return that.callback.addRoute( name, routeData, phase );

			})
			.fail(function() {
				alert( "Sorry! An Error occured while loading the route :(" );
			});
			// .always(function() {
			// 	alert( "complete" );
			// });

		}
		else {
			//IF NO JSON OBJECT GIVEN
			alert("Call to loadRoute without providing a Link to a datalist");
		}
	
	};

	var load = function ( universe, heightData ) {
	
		// ROUTES
		///////////
		// CORS in PHP m8 http://stackoverflow.com/questions/14467673/enable-cors-in-htaccess
		
		var routeLoader = new RouteLoader( universe );

		if( !params.route || params.route === "asien" ) {
			var datalistAsia = "http://relaunch.panoreisen.de/index.php?article_id=7&rex_geo_func=datalist";
			var phase = 0.96;
			var name = "Asien 2010-2013";
			// universe.loadRoute( name, datalistAsia, phase );
			routeLoader.load( datalistAsia, name, phase, heightData );
		}

		// Finally, to get the param you want
		if( params.route === "usa" ) {
			var datalist2 = "http://relaunch.panoreisen.de/index.php?article_id=105&rex_geo_func=datalist";
			var phase = 4;
			var name = "USA";
			// universe.loadRoute( name, datalist2, phase );
			routeLoader.load( datalist2, name, phase, heightData );
		}
		
		// var route = ModuleRoute.createRoute( asien2010 ); //{ meshes: true, labels: true, lights: true, lines: true } 
	}
	
	return load;

});