/**
 * Setup the control method
 */
define(["three","camera","renderer","isMobile"], function (THREE,camera,renderer,isMobile) {

	// CONTROLS
	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	// this.controls = new THREE.OrbitObjectControls( camera, renderer.domElement );
	// var controls = new THREE.OOrbitControls( camera, renderer.domElement );

	// r73 OOC
	// controls.enableDamping = true;
	// controls.constraint.dollyIn( 1.3 ); // 1.3 zoom in ca. distance 300 //
	controls.enablePan = false;
	controls.enableKeys = false;
	controls.minDistance	= 200; //220 (150 bisher) // 170
	controls.maxDistance	= 700; //(400 bisher) // war 430
	controls.zoomSpeed	= 0.3; // slow zoom speed for middle mouse
	controls.rotateSpeed = 0.5;

	// smooth Zoom
	// controls.constraint.smoothZoom = true;
	// controls.constraint.zoomDampingFactor = 0.2;
	// controls.constraint.smoothZoomSpeed = 2.0;	

	controls.smoothZoom = true;
	controls.zoomDampingFactor = 0.2;
	controls.smoothZoomSpeed = 2.0;

	controls.target.set( 0, 10, 0 );
	
	
	if ( isMobile.any() ) 
	{
		controls.enableRotate = true;
	} else {
		controls.enableRotate = false;
	}

    return controls;
});