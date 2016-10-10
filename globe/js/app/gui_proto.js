/**
 * guistuff
 */
define(["three","putils","dat"], function (THREE,putils,dat) {

	'use strict';

	function Guistuff() {
		
		var defaults;
		var earthSphere;
		var cloudSphere;
		var eMDisplace;
		var route;
		var maps;
		var earthGeoArray;
		this.data;
		this.citys;
		this.gui;
		
	}

	Guistuff.prototype.ellesGui = function( data, controls, animationCallback, scope, textures, mesh, meshArray, mesh2 ){
					
			// defaults = clone( parameters );
			// earthSphere	= mesh;
			// earthGeoArray = meshArray;
			// cloudSphere	= mesh2;
			// eMDisplace	= mesh.material;
			// route = groups;
			// maps = textures;
			var that = this;
			this.citys = data;

			this._controls = controls;
		
			this.gui = new dat.GUI();
			
			// var folder1 = gui.addFolder('Earth');
			// var folder2 = gui.addFolder('Route');
			// var folder3 = gui.addFolder('Misc');
			// var folder4 = gui.addFolder('Dev');
			// var folder5 = folder4.addFolder('Sun');
			// var folder6 = folder4.addFolder('Moon');
			var folder7 = this.gui.addFolder('Points of Interest');

			folder7.close(); //POI
			
			/*
			
			folder1.add( parameters, 'map', [ "standard", "alternative", "night", "extra" ] ).onChange(function( value ) //alternative: .listen()
			{
				var selection = value;
				var newmap;
				
				if(parameters.HD){
					if ( selection === 'standard' ) {
						newmap =  textures.diffusemap8;//THREE.ImageUtils.loadTexture( "textures/planets/Color-Map-4k.jpg" );
					} else if ( selection === 'alternative' ) {
						newmap = textures.alternative8;
					} else if ( selection === 'night' ) {
						newmap = textures.night8;
					} else if ( selection === 'extra' ) {
						newmap = textures.extra8;
					}
				} else {
					if ( selection === 'standard' ) {
						newmap =  textures.diffusemap;//THREE.ImageUtils.loadTexture( "textures/planets/Color-Map-4k.jpg" );
					} else if ( selection === 'alternative' ) {
						newmap = textures.alternative;
					} else if ( selection === 'night' ) {
						newmap = textures.night;
					} else if ( selection === 'extra' ) {
						newmap = textures.extra;
					}
				}
				
				if( parameters.useDisplace ) {
					earthSphere.material.uniforms.tDiffuse.value = newmap;
				} else {
					earthSphere.material.map = newmap;
				}	
			});
			
			folder1.add( cloudSphere, 'visible' ).name( "Wolken" );
			// folder1.add( earthSphere.material, 'wireframe' )		
			
			folder1.add( parameters, "wireframe" ).onChange( function ( value ) 
			{
				for ( var i = earthGeoArray.children.length - 1; i >= 0; i -- ) {
					earthGeoArray.children[ i ].material.wireframe = value;
				}
			});
			
			folder2.add( parameters, "showRoute" ).onChange( function ( value ) 
			{ 			
				for ( var i = route.children.length - 1; i >= 0; i -- ) {
					for ( var j = route.children[ i ].children.length - 1; j >= 0; j -- ) {
						var element = route.children[ i ].children[j];
		
						element.visible = value; 
					}
				}
				
			});
			
			
			folder2.add( parameters, "showLabels" ).onChange( function ( value ) 
			{ 			
				route.children[1].visible = value;
				
			});		
			

			folder2.addColor( parameters, 'color' ).onChange(function(value) // onFinishChange
			{  
				for ( var i = route.children.length - 1; i >= 0; i -- ) {
					for ( var j = route.children[ i ].children.length - 1; j >= 0; j -- ) {
						var element = route.children[ i ].children[j];
						
						// SET MARKER
						if ( element instanceof THREE.Mesh ) {
							element.material.color.setHex( value.replace( "#", "0x" ) ); 
							element.material.emissive.setHex( value.replace( "#", "0x" ) ); 
						}
						// SET LIGHTS
						else if ( element instanceof THREE.Light ) {
							element.color.setHex( value.replace( "#", "0x" ) ); 
						}
						// SET LINES
						else if ( element instanceof THREE.Line ) {
							element.material.color.setHex( value.replace( "#", "0x" ) );
						}
					}
				}
			});
			
			folder2.add( parameters, 'blobsize' ).min(0.1).max(8).step(0.01).onChange(function(value) 
			{   blobsize = value;
				updateUniverse(); 
			});
			
			folder2.add( parameters, 'frequency' ).min(0).max(3).step(0.01).onChange(function(value) 
			{   frequency = value;
				updateUniverse(); 
			});
			
			folder2.add( parameters, 'phase' ).min(0).max(6.2).step(0.01).onChange(function(value) 
			{	phase = value;
				updateUniverse(); 
			});
			
			folder2.add( parameters, 'intensity' ).min(0).max(4).onChange(function(value) 
			{
				for ( var i = route.children.length - 1; i >= 0; i -- ) {
					for ( var j = route.children[ i ].children.length - 1; j >= 0; j -- ) {
						var element = route.children[ i ].children[j];	
						// SET LIGHTS
						if ( element instanceof THREE.Light ) {
							element.intensity = parameters.intensity;
						}
					}
				}

			});
			
			//folder3.add( parameters, 'randomColorRoute' ).name('Random Color Route');
			folder3.add( { add : function(){ ModuleRoute.randomColorRoute(); } }, 'add').name( "rand col" );
			
			folder4.add( parameters, "useDisplace" ).onChange( function ( value ) 
			{	
				if( value ) { 
					// earthSphere.material = eMDisplace; 
					for ( var i = earthGeoArray.children.length - 1; i >= 0; i -- ) {
						earthGeoArray.children[ i ].material = eMDisplace;
					}
				}
				else { 
					// earthSphere.material = eMPhong; 						
					for ( var i = earthGeoArray.children.length - 1; i >= 0; i -- ) {
						earthGeoArray.children[ i ].material = eMPhong;
					}
				}
			});
			
			folder4.add( parameters, "drive" ).name( "Selber fahren" ).onChange( function ( value ) 
			{
				if( value ) { 
					//document.getElementsByTagName('audio')[0].volume = 0.3;
					document.getElementsByTagName( "audio" )[ 1 ].play();
								
					// van model
					var loader = new THREE.OBJMTLLoader();
					loader.load( 'earth/models/van/Van.obj', 'earth/models/van/Van.mtl', function ( object ) {
						van = object;
						van.scale.set( 0.015,0.015,0.015 ); 
						//van.rotation.set(52*Math.PI/180, 0, 0);
						van.rotation.set(parameters.vanx, parameters.vany, parameters.vanz);
						van.position.set(parameters.vanposx, parameters.vanposy, parameters.vanposz);
						van.name = "van";
						scene.add( van );

						controls.target = van.position;
						controls.noKeys = false;
						controls.dollyIn(10); //dollyIn all the way
						controls.minDistance = 30; //40 für truck
						controls.noRotate = false;
						controls.maxDistance = 300;
					});
								
					/*
					// goat model
					var loader = new THREE.OBJMTLLoader();
					loader.load( 'models/Goat_01/Goat.obj', 'obj/Goat_01/Goat.mtl', function ( object ) {
						van = object;
						van.scale.set(2.02,2.02,2.02); 
						van.rotation.set(52*Math.PI/180, -Math.PI/2, 0);
						
						van.position.set(0, 60, 80);
						van.name = "van";
						van.children[0].children[1].material.normalMap = THREE.ImageUtils.loadTexture( "obj/Goat_04/Goat_N.png" ); 
						van.children[0].children[1].material.specularMap = THREE.ImageUtils.loadTexture( "obj/Goat_04/Goat_S.png" ); 
						
						van.traverse( function ( object ) {  object.visible = false;  } );
						scene.add( van );
					});
					*/
		/*
				}
				else { 
				
					document.getElementsByTagName('audio')[2].volume = 0.1;
					document.getElementsByTagName('audio')[2].play();
					//van.traverse( function ( object ) { object.visible = false; } );
					//SAVE POSITION AND ROTATION OF TRUCK SO WE CAN JUMP BACK IN WHERE WE DISAPPEARED
					parameters.vanx = van.rotation.x;
					parameters.vany = van.rotation.y;
					parameters.vanz = van.rotation.z;
					parameters.vanpos = van.position;
					scene.remove( scene.getObjectByName("van") );
					controls.reset();
					controls.minDistance = 150;
					controls.maxDistance = 400;
					controls.dollyOut(1); //dolly out to start -- 3 for all the way out
					controls.noKeys = true;
					controls.noRotate = false;
				}
			});
			
			folder4.add( parameters, 'HD' ).onChange( function( value ) 
			{ 
				if( value ) { 
					if( parameters.useDisplace ) {					
						earthMaterial.uniforms.tDiffuse.value = diffusemap8;
						earthMaterial.uniforms.tSpecular.value = specularmap8;
						earthMaterial.uniforms.tNormal.value = normalmap8;
						earthMaterial.uniforms.tDisplacement.value = displacemap8;
					}
					else {
						earthSphere.material.map = diffusemap8;
						earthSphere.material.specularMap = specularmap8;
						earthSphere.material.normalMap = normalmap8;	
					}	
				}
				else {
					if( parameters.useDisplace ) {					
						earthMaterial.uniforms.tDiffuse.value = diffusemap;
						earthMaterial.uniforms.tSpecular.value = specularmap;
						earthMaterial.uniforms.tNormal.value = normalmap;
						earthMaterial.uniforms.tDisplacement.value = displacemap;
					}
					else {
						earthSphere.material.map = diffusemap;
						earthSphere.material.specularMap = specularmap;
						earthSphere.material.normalMap = normalmap;	
					}
				}
			});
			
			folder5.add( parameters, 'showSunHelper' ).onChange(function(value) 
			{ 
				if(value) { scene.add(directSunHelper); }
				else { scene.remove( scene.getObjectByName("directSunHelper") );  }	
			});
			
			folder6.add( parameters, 'showMoon' ).onChange(function(value) 
			{ 
				if(value) { moon.intensity = parameters.moonIntensity; }
				else { parameters.moonIntensity = moon.intensity; moon.intensity = 0; }
			});
			
			folder6.add( parameters, 'showmoonHelper' ).onChange(function(value) 
			{ 
				if(value) { moonHelper.update(); scene.add(moonHelper); }
				else { scene.remove( scene.getObjectByName("moonHelper") );  }	
			});	
			
			
			folder5.add ( directSun, "intensity", 0, 10 ).step ( 0.1 );
			
			folder5.add ( directSun.position, "x", -400, 400 ).step ( 1 ).onChange(
				function(){ directSunHelper.update(); }
			);
			folder5.add ( directSun.position, "y", -400, 400 ).step ( 1 ).onChange(
				function(){ directSunHelper.update(); }
			);
			folder5.add ( directSun.position, "z", -400, 400 ).step ( 1 ).onChange(
				function(){ directSunHelper.update(); }
			);
			
			folder5.add ( directSun.target.position, "x", -400, 400 ).step ( 1 ).name("Target x").onChange(
				function(){ directSunHelper.update(); }
			);
			folder5.add ( directSun.target.position, "y", -400, 400 ).step ( 1 ).name("Target y").onChange(
				function(){ directSunHelper.update(); }
			);
			folder5.add ( directSun.target.position, "z", -400, 400 ).step ( 1 ).name("Target z").onChange(
				function(){ directSunHelper.update(); }
			);
			
			folder6.add ( moon, "intensity", 0, 10 ).step ( 0.1 );
			
			folder6.add ( moon.position, "x", -400, 400 ).step ( 1 ).onChange(
				function(){ moonHelper.update(); }
			);
			folder6.add ( moon.position, "y", -400, 400 ).step ( 1 ).onChange(
				function(){ moonHelper.update(); }
			);
			folder6.add ( moon.position, "z", -400, 400 ).step ( 1 ).onChange(
				function(){ moonHelper.update(); }
			);
			
			folder6.add ( moon.target.position, "x", -400, 400 ).step ( 1 ).name("Target x").onChange(
				function(){ moonHelper.update(); }
			);
			folder6.add ( moon.target.position, "y", -400, 400 ).step ( 1 ).name("Target y").onChange(
				function(){ moonHelper.update(); }
			);
			folder6.add ( moon.target.position, "z", -400, 400 ).step ( 1 ).name("Target z").onChange(
				function(){ moonHelper.update(); }
			);
		*/

			/*
			var controller = this.gui.add( { add : function(){ animateRoute(); } }, 'add').name( "Animieren!" );

			controller.onChange(function(value) {

				// plz dont do that its a private variable
				if( scope._animation === false ) {

					this.name("Pause");

				} else {

					this.name( "Animieren!" );
				}

			  // Fires on every change, drag, keypress, etc.
			});
			*/

			// this.gui.add( scope, 'showLabels' ).name( "Zeige Label" ).onChange( function( value ) {} ).listen();
			this.gui.add( scope, 'showLabels' );
			// this.gui.add( scope, "showLabels").name( "Zeige Label" ).listen();

			// this.gui.add( { add : function(){ resetUniverse(); } }, 'add').name( "reset" );

			for ( var index = 0; index < this.citys.length; ++index) {

				if( this.citys[index].adresse !== "" )
				{
					addCityButton( index, folder7 );
				}
				else if ( index === this.citys.length-1 ) {

					that.citys[ index ].adresse = "Gesamtstrecke"
					addCityButton( index, folder7 );

				}
			}

			function addCityButton( i, folder ) {

				folder.add( { add : function(){ 

					if( that._controls.rotateToCoordinate instanceof Function ){
						that._controls.rotateToCoordinate( that.citys[ i ].lat, that.citys[ i ].lng );
					}

				} }, 'add').name( that.citys[i].adresse + " (" + putils.numberWithCommas( Math.floor( that.citys[ i ].hopDistance ) ) + " km)" );
			}

			
			this.gui.open();

			
			//updateUniverse(); 
			
		// };
		
		/*
		function updateUniverse()
		{		
			//TODO RESET PARAMETER.COLORS 
			
			for ( var i = earthGeoArray.children.length - 1; i >= 0; i -- ) {
				earthGeoArray.children[ i ].material = eMDisplace;
				earthGeoArray.children[ i ].material.uniforms.tDiffuse.value = maps[parameters.map];
				earthGeoArray.children[ i ].material.wireframe = parameters.wireframe;
			}
			
			// earthSphere.material = eMDisplace; 
			
			cloudSphere.visible = parameters.clouds;
			
			directSun.intensity = parameters.directSunIntensity;
			directSun.position.set( parameters.directSunx, parameters.directSuny, parameters.directSunz ); //TODO (parameters.dSx) etc
			directSun.target.position.set( parameters.directSunTargetx, parameters.directSunTargety, parameters.directSunTargetz );
			directSunHelper.update();
			
			moon.intensity = parameters.intensity;
			moon.position.set( parameters.moonx, parameters.moony, parameters.moonz );
			moon.target.position.set( parameters.targetx, parameters.targety, parameters.targetz );
			moonHelper.update();
			
			//SET MARKES & ROUTE COLORS, VISIBILITY
			for ( var i = route.children.length - 1; i >= 0; i -- ) {
				for ( var j = route.children[ i ].children.length - 1; j >= 0; j -- ) {
					var element = route.children[ i ].children[j];

					element.visible = parameters.showRoute; 
					var color = ModuleRoute.makeColorGradient( j, parameters.frequency, undefined, undefined, parameters.phase );
					
					// SET MARKER
					if ( element instanceof THREE.Mesh ) {
						element.scale.x = element.scale.y = element.scale.z = parameters.blobsize; //scale
						element.material.color.set( color );	//color blobs
						element.material.emissive.set( color ); //color blobs emissive
					}
					// SET LIGHTS
					else if ( element instanceof THREE.Light ) {
						element.color.set( color );
						element.intensity = parameters.intensity;
					}
					// SET LINES
					else if ( element instanceof THREE.Line ) {
						element.material.color.set( color );
					}
				}
			}
		}
		*/



		var animateRoute = function(){	

			animationCallback( scope );

		};

		var resetUniverse = function(){	
			// RESET ALL PARAMETERS TO INIT VALUES
			// for ( var k in parameters ){
			// 	if (parameters.hasOwnProperty(k)) {
			// 		parameters[k] = defaults[k];
			// 	}
			// }

			scope.stopAnimate();
			that._controls.rotateToCoordinate( that.citys[ 0 ].lat, that.citys[ 0 ].lng );
			
			// updateUniverse();
		};
		
		function clone(obj){
			if(obj === null || typeof(obj) !== 'object')
				return obj;
		
			var temp = new obj.constructor(); 
			for(var key in obj)
				if (parameters.hasOwnProperty(key)) {
					temp[key] = clone(obj[key]);
				}
				
			return temp;
		}
		
		return this.gui;
		
		// {
			// ellesGui : ellesGui,
			// resetUniverse : resetUniverse
		// };
	};

    return Guistuff;
});

	