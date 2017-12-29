/**
 * Skybox
 */

define(["three"], function (THREE) {

	'use strict';
	
	var skybox = function ( texture ) {
	
		// SKYBOX
		var geometry = new THREE.SphereGeometry( 400, 8, 4 );
		var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.BackSide } );
		// http://www.1zoom.net/Space/wallpaper/330018/z747.9/
		var mesh = new THREE.Mesh( geometry, material	);
		mesh.rotation.set( 0, Math.PI, 0 );
		mesh.position.set( 0, - 125, 0 );

		return {

			mesh: mesh,

			update: function( delta ) {

				mesh.rotation.y += delta * 0.007;
				
			}

		}
	}
	
	return skybox;

});