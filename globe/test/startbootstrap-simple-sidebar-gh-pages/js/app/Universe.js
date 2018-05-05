/**
 * Core application handling
 * https://github.com/Rinkana/SoIsLife/tree/three.js/www/js/app
 * http://maxberends.nl/
 */

define([
    'three',
    'threexDomEvents',
    'controls',
    'scene',
    'camera',
    'HUD',
    'MarkerFactory',
    'Globe',
    'Route',
    "container"
], function (THREE, THREEX, controls, scene, camera, HUD, MarkerFactory, Globe, Route, container) {

	'use strict';

	function Universe( textures, heightData ) {

		console.log( "Initializing the Universe" );

		Universe.routeInstances = 0;
		Universe.loadedRoutes = 0;

		// contains loaded routes
		this.routes = [];
		
		// group for controls
		// this.group	= new THREE.Object3D();
		this.group	= new THREE.Group();
		scene.add( this.group );
		
		// this.camera = camera;
		// this._controls = controls;
		controls.group = this.group;
		
		var HUDContainer = document.getElementById("wrapper");
		this._gui = new HUD( HUDContainer );
		
		this._domEvents = new THREEx.DomEvents( camera, container );

		this._markerFactory = new MarkerFactory( this._domEvents, container );

		//create globe
		var radius = 100;
		var globe = new Globe( radius, textures, heightData );
		this._globe = globe;
		globe.innerGlow();
		globe.outerGlow();
		globe.clouds( textures.cloudmap );
		
		this.group.add( globe.mesh );


	}

	// addRoute is called after loading the route-JSON
	// as callback inside the RouteLoader.js
	Universe.prototype.addRoute = function ( name, routeData, phase ) {

		var route = new Route( this._markerFactory );

		route.name = name;
		route.phase = phase || PANOUTILS.getRandomArbitrary( 0, 6.2 );
		// route.heightData = heightData;

		Universe.routeInstances++;
		// console.log("universe.routeInstances", Universe.routeInstances );
		
		// ASYNC zwecks GoogleMaps API
		route.createRoute( routeData, this.group );
		
		// this.group.add( groupElements );
		
		route.isVisible = true;

		this._gui.createLabel( route );

		this.routes.push( route );

	};

	Universe.prototype.addRoutes = function () {

		// var groups = [];
		// groups.push( 
		// 	this.routes[ 0 ].meshGroup, 
		// 	this.routes[ 0 ].lightGroup, 
		// 	this.routes[ 0 ].spriteGroup, 
		// 	this.routes[ 0 ].line
		// 	);

		if ( this.routes.length === 1 ) {

			// for( var i = 0; i < groups.length; i ++ ) {

			// 	groups[ i ].visible = false;

			// }

			// this.routes[ 0 ].isVisible = false;

			var datalist2 = "http://relaunch.panoreisen.de/index.php?article_id=105&rex_geo_func=datalist";
			var phase = 4;
			this.loadRoute( "USA", datalist2, phase );

		}

	};

	Universe.prototype.update = function () 
	{

	// TODO
	// set scale and opacity only when zooming
	// dann kann man auch vergrößern beim hovern
	//

		this._markerFactory.update();

		for ( var i = 0; i < this.routes.length; i ++ ) {

			if ( this.routes[ i ].isVisible === true ) {

				this.routes[ i ].update( camera );
				
			}

		}
		
	};

	return Universe;
    // return {
    //     initialize: initialize,
    //     animate: animate
    // }
});