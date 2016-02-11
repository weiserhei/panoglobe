/**
 * Create a camera
 * and handle window resize
 */
define(["three","renderer","container"], function (THREE,renderer,container) {
    
    'use strict';

    // CAMERA
    var screen_width    = window.innerWidth;
    var screen_height   = window.innerHeight;
    var aspect = screen_width / screen_height;
    var view_angle  = 25; // 25
    var near = 10;
    var far = 1500;
    
    var camera  = new THREE.PerspectiveCamera( view_angle, aspect, near, far );
    camera.position.set( 0, 80, 580 ); //580
    // camera.lookAt( new THREE.Vector3( 0, 20, 0) );   
    // scene.add( camera );

    var callback    = function(){

        var width = window.innerWidth;
        var height = window.innerHeight;
        
        // notify the renderer of the size change
        renderer.setSize( width, height );
        // update the camera
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    
    }

    window.addEventListener( 'resize', callback, false );

    // var updateSize = function () {
    //     camera.aspect = container.element.offsetWidth / container.element.offsetHeight;
    //     camera.updateProjectionMatrix();
    // };

    return camera;

});