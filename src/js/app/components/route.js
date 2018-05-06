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

export default class Route {
    constructor( scene, markerFactory, routeData, heightData, radius, phase ) {

        this.name = routeData.meta.name || "";
        this._routeData = Panoutils.calc3DPositions( routeData.gps, heightData, radius+10 );

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
		
		var poiCounter = 0;

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
			// _addLink( marker, hudLabel, currentCoordinate );
			// this._markerFactory.linkify( marker, infoBox, currentCoordinate );

			var name = currentCoordinate.countryname || currentCoordinate.adresse;
			// CREATE LABELS FOR MARKER
			// sprite = this._markerFactory.createSprite( ++poiCounter + " " + currentCoordinate.adresse, marker.position.clone() );

			sprite = this._markerFactory.createSprite( ++poiCounter + " " + name, marker.position.clone() );
			this.spriteGroup.add ( sprite.sprite );
			this.sprites.push( sprite );
			// CREATE LIGHTS FOR BLOBS
			// when using lights wait for the route to be loaded!
			// var intensity = 1;
			// var light = this._markerFactory.createLight( currentCoordinate, color, intensity );
			// this.lightGroup.add( light );

		})

		/*
		for ( var i = 0; i < routeData.length; i ++ ) {			

			color.set( Colors.makeColorGradient( i, frequency, undefined, undefined, phase ) );
			currentCoordinate = routeData[ i ];

			this._routeLine.connect( routeData[ i ] );

			// console.log( routeData[ i ].adresse ,routeData[ i ].hopDistance );
			// DONT DRAW MARKER WHEN THEY HAVE NO NAME
			if ( ! currentCoordinate.adresse ) { continue; };

			// this._markerIndexes.push ( i );

			this._cityMarkers.push ( this._routeData[ i ] );

			// CREATE MARKER
			marker = this._markerFactory.createMarker( currentCoordinate.displacedPos.clone(), color );
			this.meshGroup.add( marker );

			// CREATE HUDLABELS FOR MARKER
			infoBox = this._markerFactory.createInfoBox( currentCoordinate, marker );

			//MAKE MARKER CLICKABLE
			// _addLink( marker, hudLabel, currentCoordinate );
			// this._markerFactory.linkify( marker, infoBox, currentCoordinate );

			var name = currentCoordinate.countryname || currentCoordinate.adresse;

			// var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + currentCoordinate.lat + "," + currentCoordinate.lng + "&sensor=false";
			// var request = ajax( i, url, marker.position.clone() );
			// promises.push( request );
			
			// CREATE LABELS FOR MARKER
			// sprite = this._markerFactory.createSprite( ++poiCounter + " " + currentCoordinate.adresse, marker.position.clone() );

			// sprite = this._markerFactory.createSprite( ++poiCounter + " " + name, marker.position.clone() );
			// this.spriteGroup.add ( sprite );



		}
		*/

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
	/*

	Route.prototype.toggleAnimate = function( scope ) {

		var that = scope || this;

		if ( that._animation === false ) {

			that.startAnimate();

		} else {

			that.pauseAnimate();

		}

	};

	Route.prototype.startAnimate = function() {

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

	Route.prototype.pauseAnimate = function() {

		this._animation = false;

	};

	Route.prototype.stopAnimate = function() {

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


	Route.prototype.reset = function() {

		this.stopAnimate();
		if( controls.rotateToCoordinate instanceof Function ){
			controls.rotateToCoordinate( this._routeData[ 0 ].lat, this._routeData[ 0 ].lng );
		}

		if ( this._markerFactory.active !== null ) {
			// close open infoBoxes
			this._markerFactory.active._3xDomEvent.clickHandlers[ 0 ].callback();
			
		}

	};

	var delay = 0;
	var target = 2;

	Route.prototype.animate = function( controls ) {

		// if( delay === target ) {

			delay = 0;

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

		// } else { delay ++; }

	};
	*/

}

Route.prototype._updateLabel = (function() { 
	
		var meshVector = new THREE.Vector3();
		var eye = new THREE.Vector3();
		var dot = new THREE.Vector3();
		var ocluded = false;

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

				// meshVector = this.meshGroup.children[ i ].getWorldPosition();
				this.meshGroup.children[ i ].getWorldPosition( meshVector );
				eye = camera.position.clone().sub( meshVector );
				dot = eye.clone().normalize().dot( meshVector.normalize() );
						
				ocluded = true ? (dot < 0.0) : false; //IS TRUE WHEN BLOB IS BEHIND THE SPHERE = dot value below 0.0
				
				if ( this.sprites[i] !== undefined ) {

					this.sprites[i].update( ocluded, eye, this.showLabels );

					//IF BLOBS VISIBLE: SET BLOB+SPRITE VISIBLE AND SCALE ACCORDING TO ZOOM LEVEL
					if ( !ocluded ) {			
						this.meshGroup.children[ i ].scale.set( 1, 1, 1 ).multiplyScalar( 0.2 + ( eye.length() / 600 ) ); // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60
						//this.banner.clickable = this.mesh.pinned;
					}

				}

			}

		}
	}
)();