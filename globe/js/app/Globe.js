/**
 *	Globe Class
 *	creating the earth and stuffs
 */

define([
       "three",
       "isMobile",
       "urlParameters",
       "threexAtmosphereMaterial",
       "renderer",
], function (THREE,isMobile,params,THREEX,renderer) {

	'use strict';

	function Globe ( radius, textures, heightData ) {
		
		this.radius = radius;
		this.textures = textures;
		this.heightData = heightData;
		// this.geometry = null;

		///////////
		// EARTH //
		///////////

		var textures = this.textures;

	    if( isMobile.any() ) 
		{

			// alert('Mobile');
			var lambertMaterial = new THREE.MeshLambertMaterial({
				color:0xFFFFFF,
				map: textures.alternative,
				specularMap: textures.specularmap, 
			});

			var sphereGeo1	= new THREE.IcosahedronGeometry( this.radius, 3 );
			var earthMaterial = lambertMaterial;


		} else {

			var maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
			textures.alternative.anisotropy = maxAnisotropy; //REMOVE FOR PERFORMANCE

			// create 2 Level of details in geometry, start zoom is at detail 2
			var sphereGeo1	= new THREE.IcosahedronGeometry( this.radius, 5 );
			// var sphereGeo2	= new THREE.IcosahedronGeometry( this.radius, 3 );
			// var sphereGeo3	= new THREE.IcosahedronGeometry( parameters.radius, 4 );

			// alert('Desktop');
			var phongMaterial = new THREE.MeshPhongMaterial({
				color:0xFFFFFF,
				specular: 0xBBBBBB,
				shininess: 8,
				map: textures.alternative,
				specularMap: textures.invertedSpecularmap, 
				normalMap: textures.normalmap,
				normalScale: new THREE.Vector2( - 0.2, - 0.2 ),
				displacementMap: textures.displacemap,
				displacementScale: 3.2,
				// displacementBias: - 0.428408,
			});

			// var standardMaterial = new THREE.MeshStandardMaterial( {
			// 	color:0xFFFFFF,
			// 	metalness: 0.5,
			// 	roughness: 0.5,
			// 	map: textures.alternative,
			// 	// roughnessMap: textures.specularmap, 
			// 	// metalnessMap: textures.metalnessMap, 
			// 	normalMap: textures.normalmap,
			// 	normalScale: new THREE.Vector2( - 0.2, - 0.2 ),
			// 	displacementMap: textures.displacemap,
			// 	displacementScale: 3.2,
			// } );

			var earthMaterial = phongMaterial;
			// var earthMaterial = standardMaterial;

			// var blendImage = THREE.ImageUtils.loadTexture("textures/wco.png");
			// var earthMaterial = _normalDisplacementMaterial( textures[parameters.map] );
			// var earthMaterial = _normalDisplacementMaterial( blendImage );
			
		}

		// var dg = debugGui;
		// var name = "Scene";
		// if ( dg.__folders[ name ] ) {
		// 	var folder = dg.__folders[ name ];
		// } else {
		// 	var folder = dg.addFolder( name );
		// }
		// var folder = dg;
        // folder.addThreeColor( earthMaterial, "color" );
        // folder.add( standardMaterial, "metalness" ).min( 0 ).max( 1 );
        // folder.add( standardMaterial, "roughness" ).min( 0 ).max( 1 );

		sphereGeo1.applyMatrix( new THREE.Matrix4().makeScale( - 1, 1, - 1 ) ); 
		this.geometry = sphereGeo1;
		// sphereGeo1.computeTangents(); // removed in r72 :(
		
		// var lodgeometry = [ 
		// 	[ sphereGeo1, 140 ],
		// 	[ sphereGeo2, 300 ]
		// 	// [ sphereGeo3, 330 ]
		// ];
		// var mesh = createLOD( lodgeometry, earthMaterial );

		// var earthMaterial = OverlayShader();
		// var earthMaterial = _phongMaterial();


		// TRANSPARENT SHADER
		/*
		// texture
		var texture = textures[parameters.map];
		// var texture2 = THREE.ImageUtils.loadTexture("textures/earth-outline-shifted-gray_transparent.png");
	    // var texture = new THREE.Texture( generateTexture( ) ); // texture background is transparent
	    // texture.needsUpdate = true; // important
		// uniforms
		var uniforms = {
			texture: { type: "t", value: texture },
			texture2: { type: "t", value: texture2 }
		};

		// attributes
		var attributes = {
		};

		// material
		var material = new THREE.ShaderMaterial({
			attributes      : attributes,
			uniforms        : uniforms,
			vertexShader    : document.getElementById( 'vertex_shader' ).textContent,
			fragmentShader  : document.getElementById( 'fragment_shader' ).textContent
		});
		*/
	    // TRANSPARENT SHADER


		var mesh = new THREE.Mesh ( sphereGeo1, earthMaterial );

		if ( params.overlay === "borders" )
		{

			var textureLoader = new THREE.TextureLoader ();
    		var borderImage = "textures/woc2.png";

			var texture2 = textureLoader.load( borderImage );
			var maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
			texture2.anisotropy = maxAnisotropy; //REMOVE FOR PERFORMANCE

			// var texture2 = THREE.ImageUtils.loadTexture("textures/wco_white.png");
		    // Multi Material Object
		    // z-fighting
		    // https://github.com/mrdoob/three.js/issues/2593
		    var mat = new THREE.MeshBasicMaterial({
		    	map: texture2,
		  		transparent: true,
				depthWrite: false,
				opacity: 1,
				blending: THREE.AdditiveBlending,
				color: 0xAAAAAA,
				depthTest: false,
				// polygonOffset: true,
				// polygonOffsetFactor: -75
		    });
			
			var mapMesh = new THREE.Mesh ( this.geometry.clone(), mat );
			mapMesh.geometry.applyMatrix( new THREE.Matrix4().makeScale( - 1, 1, - 1 ) ); 

			mesh.add( mapMesh );

		}

	    // var mesh = THREE.SceneUtils.createMultiMaterialObject( sphereGeo1, [earthMaterial, mat] );
		// mesh.geometry.applyMatrix( new THREE.Matrix4().makeScale( - 1, 1, - 1 ) ); 
		// mesh.geometry.computeTangents();

		mesh.matrixAutoUpdate = false;
		mesh.updateMatrix();

		// http://stackoverflow.com/questions/16247280/force-a-sprite-object-to-always-be-in-front-of-skydome-object-in-three-js
		// why did i put this in	
		// mesh.renderDepth = 1e20;


		////////////
		// CUSTOM //
		////////////

		// var planeMaterial = this.countrySelectMaterial();

		// // var geometry = new THREE.SphereGeometry( 100, 64, 32 );
		// var geometry	= new THREE.IcosahedronGeometry( this.radius, 5 );
		// mesh = new THREE.Mesh( geometry, planeMaterial );
		// mesh.geometry.applyMatrix( new THREE.Matrix4().makeScale( - 1, 1, - 1 ) ); 
		// mesh.geometry.computeTangents();
		// mesh.position.set(0,0,0);
		// // scene.add(mesh);

		// this.countrySelect( mesh );

		this.mesh = mesh;

		function createLOD( lodgeometry, material ) 
		{

			var lod = new THREE.LOD();
			var mesh;

			for ( i = 0; i < lodgeometry.length; i ++ ) {
			
				lodgeometry[ i ][ 0 ].applyMatrix( new THREE.Matrix4().makeScale( - 1, 1, - 1 ) ); 
				lodgeometry[ i ][ 0 ].computeTangents();

				mesh = new THREE.Mesh( lodgeometry[ i ][ 0 ], material );
				mesh.updateMatrix();
				mesh.matrixAutoUpdate = false;
				lod.addLevel( mesh, lodgeometry[ i ][ 1 ] );
			}
			lod.updateMatrix();
			lod.matrixAutoUpdate = false;
			
			return lod;

		}

	}

	Globe.prototype.createEarth1 = function ()
	{

		var sphereGeo1	= new THREE.IcosahedronGeometry( this.radius, 2 );
		this.geometry = sphereGeo1;

		var material = new THREE.MeshLambertMaterial( { color: 0xCCCCFF } );

		var mesh = new THREE.Mesh( sphereGeo1, material );

		return mesh;

	};

	Globe.prototype.createEarth = function ()
	{


	};

	Globe.prototype.countrySelectMaterial = function ()
	{
		
		// Create the "lookup texture", which contains a colored pixel for each country 
		//  -- the pixel at (x,1) is the color of the country labelled with gray RGB_Color(x,x,x,1).
		lookupCanvas = document.createElement('canvas');	
		lookupCanvas.width = 256;
		lookupCanvas.height = 1;
		lookupContext = lookupCanvas.getContext('2d');
		lookupTexture = new THREE.Texture( lookupCanvas );
		lookupTexture.magFilter = THREE.NearestFilter;
		lookupTexture.minFilter = THREE.NearestFilter;
		// lookupTexture.needsUpdate = true;
		
		var mapTexture = THREE.ImageUtils.loadTexture("textures/earth-index-shifted-gray.png");
		mapTexture.magFilter = THREE.NearestFilter;
		mapTexture.minFilter = THREE.NearestFilter;
		// mapTexture.needsUpdate = true;
		
		var outlineTexture = THREE.ImageUtils.loadTexture("textures/earth-outline-shifted-gray.png");
		// outlineTexture.needsUpdate = true;
		
		var blendImage = THREE.ImageUtils.loadTexture("textures/earth-day.jpg");
		
		var planeMaterial = new THREE.ShaderMaterial( 
		{
			uniforms:
			{
				width:      { type: "f", value: window.innerWidth },
				height:     { type: "f", value: window.innerHeight },
				mapIndex:   { type: "t", value: mapTexture },
				outline:    { type: "t", value: outlineTexture },
				lookup:     { type: "t", value: lookupTexture },
				blendImage: { type: "t", value: blendImage }
				// blendImage: { type: "t", value: textures[parameters.map] }
			},
			vertexShader:   document.getElementById( 'globeVertexShader'   ).textContent,
			fragmentShader: document.getElementById( 'globeFragmentShader' ).textContent
		});

		return planeMaterial;
	};

	Globe.prototype.countrySelect = function ( mesh )
	{
		
		document.addEventListener( 'mousemove', mouseMove,  false );
		document.addEventListener( 'mousedown', mouseClick, false );

		mapCanvas = document.createElement('canvas');
		mapCanvas.width = 4096;
		mapCanvas.height = 2048;
	    mapContext = mapCanvas.getContext('2d');
	    var imageObj = new Image();
	    imageObj.onload = function() 
		{
	        mapContext.drawImage(imageObj, 0, 0);
	    };
	    imageObj.src = 'textures/earth-index-shifted-gray.png';


		// CUSTOM PANO
		var rayCaster = new THREE.Raycaster();

		// update the mouse position
		function mouseMove( event ) 
		{ 
			mouse2D.x =   ( event.clientX / window.innerWidth  ) * 2 - 1;
			mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}

		function mouseClick( event ) 
		{
			mouse2D.x =   ( event.clientX / window.innerWidth  ) * 2 - 1;
			mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			console.log("CLICK");
			var countryCode = -1;
			// var rayCaster = projector.pickingRay( mouse2D.clone(), camera );
			rayCaster.setFromCamera( mouse2D.clone(), camera );
			var intersectionList = rayCaster.intersectObject( mesh );
			if (intersectionList.length > 0 )
			{
				data = intersectionList[0];
				var d = data.point.clone().normalize();
				var u = Math.round(4096 * (1 - (0.5 + Math.atan2(d.z, d.x) / (2 * Math.PI))));
				var v = Math.round(2048 * (0.5 - Math.asin(d.y) / Math.PI));
				var p = mapContext.getImageData(u,v,1,1).data;
				countryCode = p[0];

				for( var prop in countryColorMap ) {
		        if( countryColorMap.hasOwnProperty( prop ) ) {
		             if( countryColorMap[ prop ] === countryCode )
		                 console.log(prop, countryCode);
					}
				} // end for loop
				
				lookupContext.clearRect(0,0,256,1);
				
				for (var i = 0; i < 228; i++)
				{
					if (i == 0) 
						lookupContext.fillStyle = "rgba(0,0,0,1.0)"
					else if (i == countryCode)
						lookupContext.fillStyle = "rgba(50,50,0,0.5)"
					else
						lookupContext.fillStyle = "rgba(0,0,0,1.0)"
						
					lookupContext.fillRect( i, 0, 1, 1 );
				}
				
				lookupTexture.needsUpdate = true;
			}

		} // end mouseClick function

	};

	Globe.prototype.innerGlow = function ()
	{

		var geometry = this.geometry;

		// var datGUI	= new dat.GUI()
		// var geometry	= new THREE.SphereGeometry( 100, 32, 32 );
		var material = THREEx.createAtmosphereMaterial();
		material.uniforms.glowColor.value.set( 0x00b3ff );
		material.uniforms.coeficient.value	= 0.8;
		material.uniforms.power.value		= 2.0;
		var mesh	= new THREE.Mesh( geometry.clone(), material );
		// var mesh	= new THREE.Mesh( geometry, material );
		mesh.scale.multiplyScalar( 1.01 );
		// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)
		
		// return mesh;
		this.mesh.add( mesh );

	};

	Globe.prototype.outerGlow = function ()
	{

		// outer Glow
		var geometry = this.geometry;
		// var geometry	= new THREE.SphereGeometry( 100, 32, 32 );
		var material = THREEx.createAtmosphereMaterial();
		material.side = THREE.BackSide;
		material.uniforms.glowColor.value.set( 0x00b3ff );
		material.uniforms.coeficient.value	= 0.5;
		material.uniforms.power.value		= 5.0; //less outer glow
		// material.uniforms.power.value		= 4.0
		var mesh	= new THREE.Mesh( geometry.clone(), material );
		// var mesh	= new THREE.Mesh( geometry, material );
		mesh.scale.multiplyScalar( 1.15 );
		// new THREEx.addAtmosphereMaterial2DatGui(material, datGUI)

		// return mesh;
		this.mesh.add( mesh );

	};

	Globe.prototype.clouds = function ( texture )
	{

		/////////
		//CLOUDS
		/////////

		var geometry = this.geometry;

		var cloudMaterial	= new THREE.MeshBasicMaterial( { 
			map	: texture,
			transparent	: true, 
			opacity	: 0.3,
			blending	: THREE.AdditiveBlending
		} ); 

		var cloudSphere = new THREE.Mesh( geometry.clone(), cloudMaterial );
		cloudSphere.scale.multiplyScalar ( 1.035 );
		// cloudSphere.scale.x = cloudSphere.scale.y = cloudSphere.scale.z = 1.035;

		// return cloudSphere;
		this.mesh.add( cloudSphere );

	};

	Globe.prototype.createAdvancedEarth = function ()
	{

		/*
		sphereGeo2.computeTangents();
		sphereGeo2.applyMatrix( new THREE.Matrix4().makeScale( - 1, 1, - 1 ) ); 
		var overlayMaterial = new THREE.MeshBasicMaterial( {
			color: 0xffffff, 
			// wireframe: true,
			map: THREE.ImageUtils.loadTexture( "earth-outline-shifted2.png" ),
			opacity: 0.3,
			transparent: true,
			// depthTest: true,
			// depthWrite: false,
			// polygonOffset: true,
			// polygonOffsetFactor: -1000,
			// anisotropy: 16
		});
		overlayMaterial.map.anisotropy = 16;
		
		// http://stackoverflow.com/questions/17577853/rotate-sphere-texture-three-js
		// overlayMaterial.map.wrapS = THREE.RepeatWrapping; // You do not need to set `.wrapT` in this case
		overlayMaterial.map.wrapT = THREE.RepeatWrapping; // You do not need to set `.wrapT` in this case
		// overlayMaterial.map.offset.x = 1 / ( 2 * Math.PI );
		overlayMaterial.map.offset.y = -0.1 * (Math.PI / 180); //shift vertical
		// overlayMaterial.map.offset.x = -0.1 * (Math.PI / 180); //shift horizontal

			
		var earthSphere = THREE.SceneUtils.createMultiMaterialObject( sphereGeo2, [
			// new THREE.MeshLambertMaterial( { color: 0xffffff} ),
			earthMaterial,
			overlayMaterial
		]);
		*/

		/*
		////////////
		// CUSTOM //
		////////////
		
		// Create the "lookup texture", which contains a colored pixel for each country 
		//  -- the pixel at (x,1) is the color of the country labelled with gray RGB_Color(x,x,x,1).
		lookupCanvas = document.createElement('canvas');	
		lookupCanvas.width = 256;
		lookupCanvas.height = 1;
		lookupContext = lookupCanvas.getContext('2d');
		lookupTexture = new THREE.Texture( lookupCanvas );
		lookupTexture.magFilter = THREE.NearestFilter;
		lookupTexture.minFilter = THREE.NearestFilter;
		lookupTexture.needsUpdate = true;

		var mapTexture = THREE.ImageUtils.loadTexture("earth-index-shifted-gray.png");
		mapTexture.magFilter = THREE.NearestFilter;
		mapTexture.minFilter = THREE.NearestFilter;
		mapTexture.needsUpdate = true;
		
		var outlineTexture = THREE.ImageUtils.loadTexture("earth-outline-shifted-gray.png");
		outlineTexture.needsUpdate = true;
		
		var blendImage = THREE.ImageUtils.loadTexture("2_no_clouds_4k.jpg");
		
		var planeMaterial = new THREE.ShaderMaterial( 
		{
			uniforms:
			{
				width:      { type: "f", value: window.innerWidth },
				height:     { type: "f", value: window.innerHeight },
				mapIndex:   { type: "t", value: mapTexture },
				outline:    { type: "t", value: outlineTexture },
				lookup:     { type: "t", value: lookupTexture },
				blendImage: { type: "t", value: blendImage }
			},
			vertexShader:   document.getElementById( 'globeVertexShader'   ).textContent,
			fragmentShader: document.getElementById( 'globeFragmentShader' ).textContent
		});
		
		// var geometry = new THREE.SphereGeometry( 100, 64, 32 );
		
		mesh = new THREE.Mesh( sphereGeo2, planeMaterial );
		mesh.position.set(0,0,0);
		scene.add(mesh);

		// document.addEventListener( 'mousemove', mouseMove,  false );
		// document.addEventListener( 'mousedown', mouseClick, false );
	/*
		mapCanvas = document.createElement('canvas');
		mapCanvas.width = 4096;
		mapCanvas.height = 2048;
	    mapContext = mapCanvas.getContext('2d');
	    var imageObj = new Image();
	    imageObj.onload = function() 
		{
	        mapContext.drawImage(imageObj, 0, 0);
	    };
	    imageObj.src = 'earth-index-shifted-gray.png';
		*/
		// var earthMaterial = new THREE.MeshLambertMaterial( { map: textures[parameters.map] } );

	}

    return Globe;
});