require.config({
    // Default load path for js files
    baseUrl: 'js/app',
    // export globals
    shim: {
        // --- Use shim to mix together all THREE.js subcomponents
        'threeCore': {exports: "THREE"},
        'OrbitObjectControls': {deps: ['threeCore'], exports: "THREE"},
        // --- end THREE sub-components
        'ShaderParticleEngine': {deps: ['threeCore'], exports: "SPE"},
        'detector': { exports: 'Detector' },
        'Stats': {exports: "Stats"},
    },
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

    }
});

require([
    // Load our app module and pass it to our definition function
    'app',
	'detector',
	'loadingScreen'
], function (App,Detector,loadingScreen) {

    'use strict';

	if ( ! Detector.webgl ) {
	
		loadingScreen.container.style.display = "none";
		// message.style.display = "none";
		loadingScreen.message.innerHTML = "<h1>No webGL, no panoglobe! :(</h1>";
		Detector.addGetWebGLMessage();
		
	} else {
		
		// The "app" dependency is passed in as "App"
		App.initialize();
		// App.animate();
	}
	
});