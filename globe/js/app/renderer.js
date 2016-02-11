/**
 * Load the engine
 */
define(["three"], function (THREE) {

    var screen_width = window.innerWidth;
    var screen_height = window.innerHeight;

    // RENDERER
    var renderer = new THREE.WebGLRenderer( { antialias:true } );
    renderer.setSize( screen_width, screen_height );

	//renderer.setClearColor(0xaaaaaa);
	// renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.BasicShadowMap;
	// renderer.shadowMap.type = THREE.PCFShadowMap;

    // document.body.appendChild( renderer.domElement );

    // var renderer = new THREE.WebGLRenderer({antialias: true});
    // container.element.appendChild(renderer.domElement);

    // var updateSize = function () {
    //     renderer.setSize(container.element.offsetWidth, container.element.offsetHeight);
    // };

    // $(window).resize(updateSize);
    // updateSize();

    return renderer;
});