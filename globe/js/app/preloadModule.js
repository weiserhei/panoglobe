/**
 * Preload
 */
define(["three","urlParameters","loadingScreen"], function (THREE,params,loadingScreen) {

    'use strict';
    
    var textures = [];

    var loadingManager = new THREE.LoadingManager ();

    loadingManager.onProgress = function ( item, loaded, total ) {

        loadingScreen.setProgress( loaded, total );

    };
	
	loadingManager.onError = function ( url ) {
	
		console.warn( "Loading Error", url );
		
	}

    var textureLoader = new THREE.TextureLoader( loadingManager );

    var manifest = [
        // 4K
        // {id:"diffusemap",    src:"earth/textures/planets/4k/Color-Map-4k.jpg"}, 
        { id:"specularmap", src:"textures/planets/4k/Spec-Mask-inverted_4k.png" },
        { id:"normalmap",   src:"textures/planets/4k/earth_normalmap_flat_4k.jpg" }, 
        { id:"displacemap", src:"textures/planets/4k/Bump_4k.jpg" }, 

        {id:"alternative",  src:"textures/planets/4k/2_no_clouds_4k.jpg" }, 
        // {id:"alternative",   src:"earth/textures/planets/8k/2_no_clouds_8k_s.jpg"}, 
        // {id:"alternative",   src:"earth/textures/planets/4k/2_no_clouds_4k_sw.jpg"}, 
        // {id:"night", src:"earth/textures/planets/4k/Night-Lights-4k.jpg"}, 
        // {id:"extra", src:"earth/textures/planets/4k/earth-day.jpg"},

        { id:"cloudmap", src:"textures/planets/4k/fair_clouds_4k.jpg" },
        { id:"starmap", src:"textures/galaxy_starfield.png" },
        // {id:"starmap",   src:"earth/textures/330018-blackangel.jpg"},
        // {id:"starmap",    src:"earth/textures/burning-planet-and-blue-galaxy.jpg"}

        //DEBUG LOADFASTER
        // {id:"van1",  src:"earth/models/van/van1.png"},
        // {id:"van_interior",  src:"earth/models/van/van_interior.png"},
        // {id:"car_glass", src:"earth/models/van/car_glass.png"},

        //8K
        // {id:"alternative",   src:"textures/planets/8k/2_no_clouds_8k_s.jpg"}, 
        // {id:"diffusemap",    src:"earth/textures/planets/8k/2_no_clouds_8k_s.jpg"}, 
        // {id:"specularmap8",  src:"earth/textures/planets/8k/Spec-Mask-8k.png"},
        // {id:"normalmap8",    src:"earth/textures/planets/8k/earth_normalmap_flat_8192x4096.jpg"}, 
        // {id:"displacemap8",  src:"earth/textures/planets/8k/Bump_8k.jpg"}, 
        
    ];

    var imageLoader = new THREE.ImageLoader ( loadingManager );

    var heightImageUrl = "textures/planets/4k/heightmap_1440.jpg";

    var start = function () {

        var heightImage = imageLoader.load( heightImageUrl );

        // alternative
        // var heightData;
        // var callback = function( image ) {
        //     heightData = getHeightData( image, 20 );
        // }


        while ( manifest.length > 0 ) 
        {

            var item = manifest.shift();
            textures[ item.id ] = textureLoader.load( item.src );

        }

        return {
        	loadingManager: loadingManager,
        	textures: textures,
            heightImage: heightImage,
        };

    };

    return start;

});