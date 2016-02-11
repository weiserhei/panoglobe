/**
 * Create a camera
 *
 * Todo: do we need jquery for this?
 */
define(["three","renderer"], function (THREE,renderer) {

    // CAMERA
    var screen_width    = window.innerWidth;
    var screen_height   = window.innerHeight;
    var aspect = screen_width / screen_height;
    var view_angle  = 25; // war 40 bisher (23.03.2015) // war 30 bisher (18.07.2015)
    var near = 0.1;
    var far = 1200;
    
    var camera  = new THREE.PerspectiveCamera( view_angle, aspect, near, far );
    camera.position.set( 0, 80, 680 );
    // camera.lookAt( new THREE.Vector3( 0, 20, 0) );   
    // scene.add( camera );

    var callback    = function(){

        var width = window.innerWidth;
        var height = window.innerHeight;
        
        // notify the renderer of the size change
        renderer.setSize( width, height );
        // update the camera
        camera.aspect   = width / height;
        camera.updateProjectionMatrix();
    
    }

    window.addEventListener( 'resize', callback, false );

    // var updateSize = function () {
    //     camera.aspect = container.element.offsetWidth / container.element.offsetHeight;
    //     camera.updateProjectionMatrix();
    // };

    return camera;

});