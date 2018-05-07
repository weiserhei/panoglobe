/**
 * Route Class
 * depends on MarkerFactory and RouteLine
 * Load the JSON routedata
 * create the Route
 */

import * as THREE from "three";
import $ from "jquery";

import Config from '../../data/config';

import * as Panoutils from "../../utils/panoutils";
import * as Colors from "../../utils/colors";

import RouteLine from "./routeLine";
import TextSprite from "./textSprite";

export default class Route {
    constructor( scene, markerFactory, routeData, heightData, radius, phase ) {

        this.name = routeData.meta.name || "";
        this._routeData = Panoutils.calc3DPositions( routeData.gps, heightData, radius+Config.globus.material.displacementScale/2 );

		this._markerIndexes = [];
		this._cityMarkers = [];
		// this._controls = controls;
		this._markerFactory = markerFactory;
		this._routeLine = null;

		this.heightData = [];
		this.phase = phase; // which color out of 2xPI
		this.steps = 1.1; // how fast change the color

		this.meshGroup = new THREE.Object3D();
		this.lightGroup = new THREE.Object3D();
		this.spriteGroup = new THREE.Object3D();
		this.line = null;
		this.sprites = [];

		this.isVisible = false;

		this._animation = false;
		this._currentInfoBox = 0;
		this.drawCount = 0;
		this.vertices = 0;

		this.showLabels = true;

        this.group	= new THREE.Group();
        scene.add( this.group );

        this._createRoute( this._routeData, this.group, this.phase, this.steps );


		// // load datalist
		// if ( url ) {			

		// 	$.getJSON( url, {
		// 		format: "json"
		// 	})
		// 	.done(data => {
        //         console.log( "Route has been loaded", data );
        //         this.numberCrunching( data );
		// 	})
		// 	.fail(function() {
		// 		alert( "Sorry! An Error occured while loading the route :(" );
		// 	});
		// 	// .always(function() {
		// 	// 	alert( "complete" );
		// 	// });

		// }
		// else {
		// 	//IF NO JSON OBJECT GIVEN
		// 	alert("Call to loadRoute without providing a Link to a datalist");
		// }
    }

    update( delta, camera ) {
        // if( this.line.material.resolution !== undefined ) {
        if( this.line.material.resolution !== undefined ) {
            this.line.material.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport
		}
		
		// hide occluded, scale on zoom
		this._updateLabel( camera );

		// if ( this._animation === true ) {
		// 	this.animate( controls );		
		// }

    }

    _createRoute( routeData, group, phase, steps ) {

		var currentCoordinate;
		var color = new THREE.Color();
		var infoBox;
		var marker;
		var sprite;

		var phase = phase;
		var steps = steps;
		var frequency = 1 /  ( steps * routeData.length );

		this._routeLine = new RouteLine( Config.routes.lineSegments );

		routeData.forEach((currentCoordinate, index) => {
			// the json looks like this: {"adresse":"Iran","externerlink":"http:\/\/panoreisen.de\/156-0-Iran.html","lng":"51.42306","lat":"35.69611"}
			if(index > 0) {
				this._routeLine.connectGeometry( routeData[index-1].displacedPos, currentCoordinate.displacedPos);
			}
			// DONT DRAW MARKER WHEN THEY HAVE NO NAME
			if ( ! currentCoordinate.adresse ) { return; }
			
			this._cityMarkers.push ( currentCoordinate );
			
			// CREATE MARKER
			color.set( Colors.makeColorGradient( index, frequency, undefined, undefined, phase ) );
			marker = this._markerFactory.createMarker( currentCoordinate.displacedPos.clone(), color );
			this.meshGroup.add( marker );

			// CREATE HUDLABELS FOR MARKER
			infoBox = this._markerFactory.createInfoBox( currentCoordinate, marker );

			//MAKE MARKER CLICKABLE
			this._markerFactory.linkify( marker, infoBox, currentCoordinate.lat, currentCoordinate.lon );

			// CREATE LABELS FOR MARKER
			const name = currentCoordinate.countryname || currentCoordinate.adresse;
			const text = this._cityMarkers.length + " " + name;
			const params = {
				fontsize: 28,
				borderThickness: 0,
				borderColor: { r: 255, g: 0, b: 0, a: 1.0 },
				backgroundColor: { r: 0, g: 0, b: 0, a: 0.4 },
				fontWeight: "normal"
			};
			sprite = new TextSprite(text, params, marker.position, this.showLabels);
			marker.sprite = sprite;
			this.spriteGroup.add ( sprite.sprite );
			this.sprites.push( sprite );

			// CREATE LIGHTS FOR BLOBS
			// when using lights wait for the route to be loaded!
			// var intensity = 1;
			// var light = this._markerFactory.createLight( currentCoordinate.displacedPos.clone(), color, intensity );
			// this.lightGroup.add( light );

		})

		// $.when.apply(null, promises).done(function(){
            // All done
			
			if(Config.routes.linewidth > 1) {
				this.line = this._routeLine.getThickLine( steps, phase, Config.routes.linewidth );
			} else {
				this.line = this._routeLine.getColoredBufferLine( steps, phase );
			}
			// var coloredLine = routeLine.getColoredLine( steps, phase );

			// length of the line
			// this.vertices = coloredLine.geometry.getAttribute('position').array.length;
			// this.vertices = this._routeLine.vertices;

			// callback( coloredLine, this.meshGroup, this.spriteGroup, this.lightGroup );

			// if( controls.rotateToCoordinate instanceof Function ){
			// 	// present the starting point on load to the user
			// 	controls.rotateToCoordinate ( routeData[ 0 ].lat, routeData[ 0 ].lng );
			// }

			// new Guistuff().ellesGui( routeData, controls, this.toggleAnimate, this );
			
			// var group = [ coloredLine, this.meshGroup, this.spriteGroup, this.lightGroup ];
			// var group = new THREE.Group();
			group.add( this.line, this.meshGroup, this.spriteGroup, this.lightGroup );
			// group.add( coloredLine, this.meshGroup, this.lightGroup );

			return group;

		// }.bind( this ));

		// this._gui = document.createElement( 'div' );
		// this._gui.id = "debug"; 
		// container.appendChild( this._gui );

		// this._gui.innerHTML = "Draw count: ";
		// this.box = document.createElement( 'div' ); 
		// this.box.className = "box"; 
		// this._gui.appendChild( this.box );	

		// this.box2 = document.createElement( 'div' );
		// this.box2.className = "box"; 
		// this._gui.appendChild( this.box2 );

		// var output = "<ul>";

		// for ( var i = 0; i < this._cityMarkers.length; i ++ ) {

		// 	output += "<li>" + this._routeData.indexOf( this._cityMarkers[ i ] ) * this._routeLine.segments + "</li>";

		// }

		// output += "</ul>";
		// this.box2.innerHTML = output;


	}

	show() {
		
		this.meshGroup.visible = true; 
		this.lightGroup.visible = true; 
		this.spriteGroup.visible = true; 
		this.line.visible = true; 
		
		this.isVisible = true;
		
	};
	
	hide() {
		
		this.meshGroup.visible = false; 
		this.lightGroup.visible = false; 
		this.spriteGroup.visible = false; 
		this.line.visible = false; 
		
		this.isVisible = false;
		
	};

	toggleAnimate( scope ) {

		var that = scope || this;

		if ( that._animation === false ) {

			that.startAnimate();

		} else {

			that.pauseAnimate();

		}

	};

	startAnimate() {

		this._animation = true;
		this.showLabels = false;

		for ( var i = 0; i < this.meshGroup.children.length; i ++ ) {

			if ( this._currentInfoBox > i ) {

				this.meshGroup.children[ i ].visible = true;

			}
			else {

				this.meshGroup.children[ i ].visible = false;

			}
			
		}

	};

	pauseAnimate() {

		this._animation = false;

	};

	stopAnimate() {

		this._animation = false;
		this._currentInfoBox = 0;
		this.showLabels = true;
		this.drawCount = 0;
		this.line.geometry.setDrawRange( 0, this.vertices );

		for ( var i = 0; i < this.meshGroup.children.length; i ++ ) {

			this.meshGroup.children[ i ].visible = true;
			// hide hover mesh
			this.meshGroup.children[ i ].children[ 0 ].visible = false;
			
		}

	};


	reset() {

		this.stopAnimate();
		if( controls.rotateToCoordinate instanceof Function ){
			controls.rotateToCoordinate( this._routeData[ 0 ].lat, this._routeData[ 0 ].lng );
		}

		if ( this._markerFactory.active !== null ) {
			// close open infoBoxes
			this._markerFactory.active._3xDomEvent.clickHandlers[ 0 ].callback();
			
		}

	};
	
	animate( controls ) {

			var drawCallCityIndex = this._routeData.indexOf( this._cityMarkers[ this._currentInfoBox ] ) * this._routeLine.segments;
			var drawCallCityIndexBefore = this._routeData.indexOf( this._cityMarkers[ this._currentInfoBox - 1 ] ) * this._routeLine.segments;
			var closeDelay = this._routeLine.segments * 5 + drawCallCityIndexBefore;


			if ( this.drawCount === drawCallCityIndex )
			{

				this.meshGroup.children[ this._currentInfoBox ].visible = true;
				this._currentInfoBox = ( this._currentInfoBox + 1 ) % ( this._cityMarkers.length );

			}

			if ( this.drawCount >= drawCallCityIndex ) {

				if ( this.meshGroup.children[ this._currentInfoBox - 1 ] !== undefined ) {

					// show infoBox
					this.meshGroup.children[ this._currentInfoBox - 1 ]._3xDomEvent.clickHandlers[ 0 ].callback();



				} 
				else if( this.meshGroup.children[ this._currentInfoBox - 1 ] === undefined ) {

					// oh god pls
					var lastCityDrawCallIndex = this._routeData.indexOf( this._cityMarkers[ this._cityMarkers.length - 1 ] ) * this._routeLine.segments;
					if ( this._currentInfoBox === 0 && this.drawCount === lastCityDrawCallIndex ) {

						this.meshGroup.children[ this._cityMarkers.length - 1 ]._3xDomEvent.clickHandlers[ 0 ].callback();

					}

				}

			}
			// meh because float drawCount
			else if ( this.drawCount >= closeDelay && this.drawCount <= closeDelay ) {

				// close infoBox
				this.meshGroup.children[ this._currentInfoBox - 1 ]._3xDomEvent.clickHandlers[ 0 ].callback();

			}


			// http://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically/31411794#31411794
			this.line.geometry.setDrawRange( 0, this.drawCount );
			// drawCount must be all vertices
			this.drawCount = ( this.drawCount + 0.5 ) % ( this.vertices );

			// "camera" follows route
			var lat = this._routeData[ Math.floor( this.drawCount / this._routeLine.segments ) ].lat;
			var lng = this._routeData[ Math.floor( this.drawCount / this._routeLine.segments ) ].lng;

			if( controls.rotateToCoordinate instanceof Function ){
				// present the starting point on load to the user
				controls.rotateToCoordinate ( lat, lng );
			}
			// controls.rotateToCoordinate ( lat, lng );
			// debug
			// this.box.innerHTML = this.drawCount + "<br>vertices: " + this.vertices + "<br>indexBefore: " + drawCallCityIndexBefore + "<br>drawCallCityIndex: " + drawCallCityIndex;

	};

}

Route.prototype._updateLabel = (function() { 
	
		var meshVector = new THREE.Vector3();
		var eye = new THREE.Vector3();
		var dot = new THREE.Vector3();
		var ocluded = false;

		var _screenVector = new THREE.Vector3();

		var width, height;

		return function updateLabel ( camera ) {

			var i = this.meshGroup.children.length - 1;
			for ( ; i >= 0 ; i -- ) {
				
				// http://stackoverflow.com/questions/15098479/how-to-get-the-global-world-position-of-a-child-object
				// var meshVector = new THREE.Vector3().setFromMatrixPosition( meshGroup.children[ i ].matrixWorld ); 

				// Annotations HTML
				// https://codepen.io/dxinteractive/pen/reNpOR

				// Like Sketchfab
				// https://manu.ninja/webgl-three-js-annotations
				
				this.meshGroup.children[ i ].getWorldPosition( meshVector );
				eye = camera.position.clone().sub( meshVector );
				dot = eye.clone().normalize().dot( meshVector.normalize() );
				ocluded = true ? (dot < 0.0) : false; //IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0

				// alternative from like Sketchfab
				// const meshDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
				// const spriteDistance = camera.position.distanceTo(this.sprites[i].sprite.position);
				// const ocluded = spriteDistance > meshDistance;
				
				if ( this.sprites[i] !== undefined ) {
					
					this.sprites[i].update( ocluded, eye, this.showLabels, dot );

					if( this._markerFactory.active !== null ) { 
						// hide marker when overlay is active
						this._markerFactory.active.sprite.update( ocluded, eye, false, dot );
					}

					//IF BLOBS VISIBLE: SET BLOB+SPRITE VISIBLE AND SCALE ACCORDING TO ZOOM LEVEL
					if ( !ocluded ) {
						this.meshGroup.children[ i ].scale.set( 1, 1, 1 ).multiplyScalar( 0.2 + ( eye.length() / 600 ) ); // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60

						if( this._markerFactory.active !== null ) {

							this._markerFactory.active.infoBox.style.display = "block";
							this._markerFactory.active.infoBox.classList.add("fadeIn");
							this._markerFactory.active.children[0].visible = true;

							// overlay is visible
							_screenVector.set(0, 0, 0);
							this._markerFactory.active.localToWorld(_screenVector);
							_screenVector.project(camera);

							var posx = Math.round((_screenVector.x + 1) * this._markerFactory._domElement.offsetWidth / 2);
							var posy = Math.round((1 - _screenVector.y) * this._markerFactory._domElement.offsetHeight / 2);

							var boundingRect = this._markerFactory.active.infoBox.getBoundingClientRect();
							this._markerFactory.active.infoBox.style.left = (posx - boundingRect.width - 28) + 'px';
							this._markerFactory.active.infoBox.style.top = (posy - 23) + 'px';

						}
						
					} else {

						this.meshGroup.children[ i ].infoBox.style.display = "none";
						this.meshGroup.children[ i ].infoBox.classList.remove("fadeIn");
						// this.meshGroup.children[ i ].children[0].visible = false;
					}

				}

			}

		}
	}
)();