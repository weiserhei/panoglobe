/**
 * Lights
 */

define(["three"], function (THREE) {

	'use strict';
	
	var lights = function () {
	
		var lights = new THREE.Group();
	
		// LIGHTS

		// HEMI + DIRECT LIGHT
		// VS 
		// AMBIENT + SPOT LIGHT

		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		hemiLight.color.setHSL( 0.6, 0.5, 1 );
		hemiLight.groundColor.setHSL( 0.095, 0.5, 0.75 );
		hemiLight.position.set( 0, 500, 0 );
		lights.add( hemiLight );

		//

		var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		dirLight.color.setHSL( 0.1, 0.1, 0.45 );
		dirLight.position.set( -1, 1.75, 1 );
		dirLight.position.multiplyScalar( 50 );
		lights.add( dirLight );

		// dirLight.castShadow = true;

		// dirLight.shadowMapWidth = 2048;
		// dirLight.shadowMapHeight = 2048;

		// var d = 50;

		// dirLight.shadowCameraLeft = -d;
		// dirLight.shadowCameraRight = d;
		// dirLight.shadowCameraTop = d;
		// dirLight.shadowCameraBottom = -d;

		// dirLight.shadowCameraFar = 3500;
		// dirLight.shadowBias = -0.0001;
		//dirLight.shadowCameraVisible = true;
		
		// AMBIENT LIGHT
		// var ambientlight	= new THREE.AmbientLight( 0xAAAAAA );
		// var ambientlight	= new THREE.AmbientLight( 0x111111 ); // goil
		// scene.add( ambientlight );	

		// SUNLIGHT
		// var directSun = new THREE.SpotLight( 0xFFFFFF, 2, 500, Math.PI / 4, 5 ); //0xFFFFFF //0x44ffaa mystic green 500, 4
		// directSun.position.set( 0, 380, 100 );	
		// scene.add( directSun.target );
		// scene.add( directSun );	

		// directSunHelper	= new THREE.SpotLightHelper( directSun, 50 );
		// directSunHelper.name	= "directSunHelper";
		
		//MOONLIGHT 
		var moon = new THREE.SpotLight( 0xCEECF5, 1.2, 500, Math.PI / 4, 5 ); //0xCEECF5 orig //0x44ffaa mystic green 500, 4	
		moon.position.set( 147, -179, -21 );
		moon.target.position.set( -74, -12, 41 );
		lights.add( moon.target );
		lights.add( moon );
		
		// moonHelper = new THREE.SpotLightHelper( moon, 50 );
		// moonHelper.name = "moonHelper";
		
		return lights;
		
	}
	
	return lights;

});