/**
 * Core application handling
 * https://github.com/Rinkana/SoIsLife/tree/three.js/www/js/app
 * http://maxberends.nl/
 */
define([
    "three",
	"clock",
    "preloadModule",
    "Universe",
    "getHeightData",
    "loadingScreen",
	"skyBox",
	"scene",
	'snowParticles',
	'lights',
	'controls',
	'stats',
	'camera',
	'renderer',
	'RouteLoader'
], function (THREE, clock, preloadModule, Universe, getHeightData, loadingScreen, skyBox, scene, snowParticles, lights, controls, stats, camera, renderer, RouteLoader) {

    var universe, galaxy, delta, particleGroup;
	
    var initialize = function () {

        var preloaded = preloadModule();

        preloaded.loadingManager.onLoad = function() {
		
			var scale = 20;
			var heightData = getHeightData( preloaded.heightImage, scale );

			loadingScreen.complete();

			console.log( "Textures have been loaded" );

			universe = new Universe( preloaded.textures, heightData );
			
			galaxy = skyBox ( preloaded.textures.starmap );
			scene.add( galaxy.mesh );
			
			var light = lights();
			scene.add( light );
			
			// loadRoutes( universe, heightData );
			RouteLoader( universe, heightData );
			
			particleGroup = snowParticles();
			particleGroup.mesh.position.set( 0, 30, 0 );
			scene.add( particleGroup.mesh );

			animate();
		
		};
		
	};

    var animate = function () {

		delta = clock.getDelta();
		
        universe.update();
		controls.update();
		stats.update();
		galaxy.update( delta );
		particleGroup.tick( delta );
		
		renderer.render( scene, camera );
		
        requestAnimationFrame( animate );

    };

    return {
        initialize: initialize,
        // animate: animate
    }
});