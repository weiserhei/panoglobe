/**
 * Marker Factory Class
 * Creates the blobs, sprites, infoboxes
 * depends on threex.DOMevents
 */

'use strict';

define([
       "three",
       "isMobile",
       "../lib/three/makeSprite",
       "camera",
       "controls"
], function (THREE,isMobile,makeSprite,camera,controls) {

	'use strict';

	function MarkerFactory( domEvents, container )
	{

		// todo
		// store selected point in url (index.html#01)
		// click next/prev in infoBoxes

		this._domElement = container;
		// this.infoBoxes = [];
		this._domEvents = domEvents;

		// this._controls = controls;
		// this._camera = camera;

		this._screenVector = new THREE.Vector3();

		this.active = null;

		// Generic Marker Stencil

		// https://stackoverflow.com/questions/15597846/three-js-sharing-shadermaterial-between-meshes-but-with-different-uniform-sets
		var phongShader = THREE.ShaderLib.phong;
		var uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

		var shaderMaterial = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: phongShader.vertexShader,
			fragmentShader: phongShader.fragmentShader,
			lights:true,
			fog: false
		});
		// var markermesh = new THREE.Mesh( pyramidGeometry, shaderMaterial );

		//CLONE MESH OR CREATE NEW MESH AND REUSE GEOMETRY?
		var markergeo = new THREE.SphereGeometry( 1, 8, 6 );
													// radiusTop, radiusBottom, Height, numberFaces, open
		// var pyramidGeometry = new THREE.CylinderGeometry( 3, 0, 8, 4, false ); 
		// var pyramidGeometry = new THREE.CylinderGeometry( 1.5, 0, 4, 4, false ); 

		// pyramidGeometry.applyMatrix( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( - Math.PI / 2, Math.PI, 0 ) ) );
		// pyramidGeometry.applyMatrix( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( Math.PI / 2, Math.PI, 0 ) ) );
		
		var markerMaterial = new THREE.MeshLambertMaterial();
		/*
		if( isMobile.any() ) 
		{
			var markerMaterial = new THREE.MeshLambertMaterial();
		} else {
			var markerMaterial = new THREE.MeshPhongMaterial();
		}
		*/
		this._markermesh = new THREE.Mesh( markergeo, markerMaterial );
		// this._markermesh = new THREE.Mesh( markergeo, shaderMaterial );

	}

	MarkerFactory.prototype.createUnit = function()
	{

		// mesh
		// outlineMesh
		// label
		// Infobox

		// var unit = { mesh: , outlineMesh: , label: , infoBox: };

	}

	MarkerFactory.prototype.createMarker = function( position, color )
	{

		var marker = this._markermesh.clone();
		marker.material = this._markermesh.material.clone();

		var hsl = color.getHSL();

		//LOWER SATURATION FOR BLOBS
		hsl.s -= 0.2;
		marker.material.color.setHSL ( hsl.h, hsl.s, hsl.l );
		// marker.material.uniforms.diffuse.value.setHSL ( hsl.h, hsl.s, hsl.l );

		//LOWER BRIGHTNESS FOR EMISSIVE COLOR
		hsl.l -= 0.3;
		// marker.material.uniforms.emissive.value.setHSL ( hsl.h, hsl.s, hsl.l );
		marker.material.emissive.setHSL ( hsl.h, hsl.s, hsl.l );

		// var ohgodwhy = position.clone();
		// ohgodwhy.y += markermesh.geometry.parameters.height / 10; // pyramid geometry

		marker.position.copy ( position ); // place marker

		// marker.lookAt( globe.mesh.position );

		var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
		var outlineMesh2 = new THREE.Mesh( marker.geometry, outlineMaterial2 );
		outlineMesh2.scale.multiplyScalar( 1.3 );
		outlineMesh2.visible = false;
		marker.add( outlineMesh2 );

		return marker;

	};

	MarkerFactory.prototype.linkify = function( mesh, domElement, city ) 
	{	

		var that = this;
		var eventTarget = mesh;
		var infoBox = domElement || undefined;
		var lat = city.lat;
		var lng = city.lng;

		function handleClick( event ) {

			function cleanUp() {

				if ( that.active.infoBox !== undefined )
				{

					// cleanup CSS
					that.active.infoBox.style.display = "none";
					that.active.infoBox.classList.remove("fadeIn");
					
				}

				// hide outline mesh
				that.active.children[0].visible = false;

			}

			// Hide the infoBox when itself is clicked again
			if ( that.active === mesh )
			{

				cleanUp();

				that.active = null;

				return;

			}

			if( controls.rotateToCoordinate instanceof Function ){
				// todo
				// modify current rotation, dont overwrite it!

				// center clicked point in the middle of the screen
				controls.rotateToCoordinate ( lat, lng );
			}

			if ( that.active !== null ) 
			{  
				
				// Cleanup when the user clicked another marker 
				// without deselecting the last

				cleanUp();

			}

			that.active = mesh;

			if ( that.active.infoBox !== undefined )
			{

				infoBox.style.display = "block";
				infoBox.classList.add("fadeIn");

			}

			mesh.children[0].visible = true;
		}
		
		// this._domEvents.addEventListener( eventTarget, 'click', handleClick, false);
		this._domEvents.bind( eventTarget, 'click', handleClick, false);

		// this._domEvents.bind( eventTarget, 'touchend', handleClick );
		
		// bind 'mouseover'
		this._domEvents.addEventListener(eventTarget, 'mouseover', function(event){

			// do nottin' when route is hidden
			if ( mesh.parent.visible === false ) {
				return;
			}

			document.body.style.cursor	= 'pointer';

			mesh.children[0].visible = true;

		}, false);
		this._domEvents.bind(eventTarget, 'mouseout', function(event){	

			if ( that.active !== mesh ) {
				mesh.children[0].visible = false;
			}

			document.body.style.cursor	= 'default';
		}, false);	

	};

	MarkerFactory.prototype.createSprite = function( message, Vec3 )
	{

		var label = makeTextSprite( message, 
			{ 
				fontsize: 32, 
				borderThickness: 0, 
				borderColor: { r:255, g:0, b:0, a:1.0 }, 
				backgroundColor: { r:0, g:0, b:0, a:0.4 },
				fontWeight: "normal"
			} );
		
		label.position.copy( Vec3 );
		
		return label;

	};

	MarkerFactory.prototype.update = function ()
	{

		// if ( this.active !== null && this.active.infoBox !== undefined ) 
		// {

		// 	// var position = THREEx.ObjCoord.cssPosition( markerMesh, camera, renderer )
		// 	var position = THREEx.ObjCoord.cssPosition( this.active, camera, renderer )
		// 	var boundingRect = this.active.infoBox.getBoundingClientRect()
		// 	// this.infoBoxes[ i ].label.style.left	= (position.x) +'px'; // rechts
		// 	this.active.infoBox.style.left = ( position.x - boundingRect.width ) +'px'; // links
		// 	// this.infoBoxes[ i ].label.style.left	= (position.x - boundingRect.width/2) +'px'; // mitte
		// 	// this.active.infoBox.style.top = ( position.y - boundingRect.height/2 - 70 )+'px'; // oben
		// 	// this.infoBoxes[ i ].label.style.top = (position.y - 70)+'px'; // mitte
		// 	this.active.infoBox.style.top = ( position.y )+'px'; // unten

		// }

		if ( this.active !== null && this.active.infoBox !== undefined ) 
		{

			this._screenVector.set( 0, 0, 0 );
			this.active.localToWorld( this._screenVector );

		    // overlay anchor is visible
		    this._screenVector.project( camera );
		    // this._screenVector.project( this._camera );

		    var posx = Math.round(( this._screenVector.x + 1 ) * this._domElement.offsetWidth / 2 );
		    var posy = Math.round(( 1 - this._screenVector.y ) * this._domElement.offsetHeight / 2 );
		    
		    // this.active.infoBox.style.display = '';
			var boundingRect = this.active.infoBox.getBoundingClientRect();
		    // this.active.infoBox.style.left = ( posx - boundingRect.width ) + 'px'; //infobox style
		    // this.active.infoBox.style.top =  ( posy ) + 'px';
		    // top a little bit right
		    // this.active.infoBox.style.left = ( posx -50 ) + 'px';
		    // this.active.infoBox.style.top =  ( posy - boundingRect.height/2 - 70 ) + 'px';	    

		    // position left top a little bit down
		    this.active.infoBox.style.left = ( posx - boundingRect.width - 28 ) + 'px';
		    this.active.infoBox.style.top =  ( posy - 23 ) + 'px';

		}

	};

	MarkerFactory.prototype.createInfoBox = function( city, markerMesh )
	{
		// todo
		// x button for close in the label

		var lng = ( Math.round(city.lng * 100)/100 ).toFixed(2);
		var lat = ( Math.round(city.lat * 100)/100 ).toFixed(2);

		var box	= document.createElement( 'div' );

		var text = "<div class='labelHead'>";
		text += "<b>" + city.adresse + "</b>";
		text += " (" + _numberWithCommas( Math.floor( city.hopDistance ) ) + " km)";
		text += "</div>";
		text += "<div class='labelContent'>";
		text += "<p>Lat: " + lat + " | Long: " + lng + "</p>";
		text += "<p><a href='" + city.externerlink + "' target='_blank'><img src='textures/newwindow.png' style='vertical-align:bottom; width:24px; height:24px;'> Point of Interest</a></p>";
		text += "</div>";
		text += "<div class='arrow'></div>";

		box.innerHTML = text;

		// + " (" + _numberWithCommas( Math.floor( routeData[ i ].hopDistance ) ) + " km)"
		// centerText.innerHTML = "<b>" + city.adresse + "</b><br>";
		// centerText.innerHTML += "<span style='font-size:0.8em;'>Lat: " + lat + " | Long: " + lng + "</span><br>";
		// centerText.innerHTML += "<a href='" + city.externerlink + "' target='_blank' style='font-size:0.8em; display:block;'>" + city.externerlink + "</a>";
		box.className = "hudLabel";
		// centerText.className = "balloon";
		box.style.display = "none";
		// centerText.style.cssText = 'position:relative; bottom:0; right:0;';
		this._domElement.appendChild( box );
		// centerDiv.appendChild( centerText );

		var closeButton	= document.createElement( 'div' );
		closeButton.innerHTML = "<a href='#' class='closeX'>X</a>";
		closeButton.className = "closeButton";
		box.appendChild( closeButton );	

		// var arrow	= document.createElement( 'div' );
		// arrow.className = "arrow";
		// centerText.appendChild( arrow );	

		// var nextButton = document.createElement( 'div' );
		// nextButton.innerHTML = "<a href='#' class='nextB'> &gt; </a>";
		// nextButton.className = "next"
		// centerText.appendChild( nextButton );

		// used to update the position
		markerMesh.infoBox = box;
		// this.infoBoxes.push( markerMesh );

		// needs a reference to the Factory to modify the active value
		$('.closeX').click( function(){ hideInfo( this, box ); return false; }.bind( this ) );

		function hideInfo( self, domElement ) {

			var that = self.active;
			// console.log("clicked", this, "centerText", domElement );

			if( that !== null && that.infoBox === domElement )
			{

				// // cleanup CSS
				that.infoBox.style.display = "none";
				that.infoBox.classList.remove("fadeIn");

				// // hide outline mesh
				that.children[0].visible = false;

				self.active = null;
				
			}

		}

		return box;
		
	/*
		return {

			domElement: centerText,

			updatePosition: function() 
			{
				// move it at the object position
				var position = THREEx.ObjCoord.cssPosition( markerMesh, camera, renderer )
		    	var boundingRect = centerText.getBoundingClientRect()
				// this.infoBoxes[ i ].label.style.left	= (position.x) +'px'; // rechts
				// this.infoBoxes[ i ].label.style.left	= (position.x - boundingRect.width/2) +'px'; // mitte
				// this.infoBoxes[ i ].label.style.left	= (position.x - boundingRect.width) +'px'; // links
				centerText.label.style.left	= (position.x - boundingRect.width) +'px'; // links
				// this.infoBoxes[ i ].label.style.top = (position.y - boundingRect.height/2 - 70)+'px'; // oben
				// this.infoBoxes[ i ].label.style.top = (position.y - 70)+'px'; // mitte
				// this.infoBoxes[ i ].label.style.top = (position.y + boundingRect.height/2 - 55 )+'px'; // unten
				centerText.label.style.top = (position.y + boundingRect.height/2 - 55 )+'px'; // unten
			}
		};
	*/

	};

	MarkerFactory.prototype.createLight = function ( city, color, intensity )
	{

		var light = new THREE.PointLight( color, intensity, 8 );
		var lightPos = city.displacedPos.clone().multiplyScalar( 1.03 ); //place light a little bit above the markers
		light.position.copy ( lightPos );

		// var helper = new THREE.PointLightHelper( light, light.distance );
		// helper.update();
		// scene.add( helper );
		
		return light;

	};

	function _numberWithCommas ( x ) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}

    return MarkerFactory;
});