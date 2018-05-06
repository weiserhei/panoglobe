/**
 * Route Loader
 */

// define(["three","jquery","putils","urlParameters"], function (THREE, $, PANOUTILS, params) {
    // 'use strict';
import $ from "jquery";

import Calc3DPositions from "../../utils/panoutils";

export default class RouteLoader {
    constructor() {

        // ROUTES
		///////////
		// CORS in PHP m8 http://stackoverflow.com/questions/14467673/enable-cors-in-htaccess
			
			// amerika
			// var datalist2 = "http://relaunch.panoreisen.de/index.php?article_id=165&rex_geo_func=datalist";
			// var phase = 4;
			// this.load( datalist2, phase, heightData );
			
			// asien
			// var datalistAsia = "http://relaunch.panoreisen.de/index.php?article_id=7&rex_geo_func=datalist";
			// var phase = 0.96;
			// this.load( datalistAsia, phase, heightData );
		// }

		// var route = ModuleRoute.createRoute( asien2010 ); //{ meshes: true, labels: true, lights: true, lines: true } 

    }
	
	load ( url, callback ) {

		// load datalist
		if ( url ) {			

			$.getJSON( url, {
				format: "json"
			})
			.done(data => {
				
                console.log( "Route has been loaded", data );
                callback( data );

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

}
