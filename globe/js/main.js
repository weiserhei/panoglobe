require.config({
    // Default load path for js files
    baseUrl: 'js/app',
    // export globals
        // Third party code lives in js/lib
    paths: {
        'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min",
        'dat': "../lib/dat.gui.min",
        'threeCore': "../lib/three/three.min",
        // 'threeCore': "../lib/three/three",
        'three': "../lib/three",
        // --- start THREE sub-components
        'OrbitObjectControls': "../lib/three/controls/OrbitControls",
        'Stats': "../lib/stats.min",
        'detector': "../lib/three/Detector",
        // --- end THREE sub-components
        'ShaderParticleEngine': "../lib/SPE.min",
        // THREEx
        'threexDomEvents': "../lib/threex.domevents",
        'threexAtmosphereMaterial': "../lib/threex.atmospherematerial",

    },
    shim: {
        // --- Use shim to mix together all THREE.js subcomponents
        'threeCore': {exports: "THREE"},
        'OrbitObjectControls': {deps: ['threeCore'], exports: "THREE"},
        // --- end THREE sub-components
        'ShaderParticleEngine': {deps: ['threeCore'], exports: "SPE"},
        'detector': { exports: 'Detector' },
        'Stats': {exports: "Stats"},
    }
});

require([
	'detector',
    "three",
    "clock",
    "preloadModule",
    "Universe",
    "loadingScreen",
    "skyBox",
    "scene",
    'lights',
    'controls',
    'stats',
    'camera',
    'renderer',
    'RouteLoader',
    "getHeightData"
], function ( Detector, THREE, clock, preloadModule, Universe, loadingScreen, skyBox, scene, lights, controls, stats, camera, renderer, RouteLoader, getHeightData ) {

    'use strict';

    var universe, galaxy, delta;

    if ( ! Detector.webgl ) {
    
        loadingScreen.container.style.display = "none";
        // message.style.display = "none";
        loadingScreen.message.innerHTML = "<h1>No webGL, no panoglobe! :(</h1>";
        Detector.addGetWebGLMessage();
        
    } else {

        var preloaded = preloadModule();

        preloaded.loadingManager.onLoad = function() {
        
            loadingScreen.complete();

            console.log( "Textures have been loaded" );

            var scale = 20;
            var heightData = getHeightData( preloaded.heightImage, scale );

            universe = new Universe( preloaded.textures, heightData );
            
            galaxy = skyBox ( preloaded.textures.starmap );
            scene.add( galaxy.mesh );
            
            var light = lights();
            scene.add( light );
            
            // loadRoutes( universe, heightData );
            RouteLoader( universe, heightData );
            
            // particleGroup = snowParticles();
            // particleGroup.mesh.position.set( 0, 30, 0 );
            // scene.add( particleGroup.mesh );

            animate();
        
        };
    }

    var animate = function () {

        delta = clock.getDelta();
        
        universe.update();
        controls.update();
        stats.update();
        galaxy.update( delta );
        // particleGroup.tick( delta );
        
        renderer.render( scene, camera );
        
        requestAnimationFrame( animate );

    };
	
});