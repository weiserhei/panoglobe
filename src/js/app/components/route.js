/**
 * Route Class
 * depends on MarkerFactory and RouteLine
 * Load the JSON routedata
 * create the Route
 */

import * as THREE from "three";

import Config from '../../data/config';

import { calc3DPositions } from "../../utils/panoutils";
import { makeColorGradient } from "../../utils/colors";

import RouteLine from "./routeLine";
import Marker from "./marker";

export default class Route {
    constructor( scene, container, domEvents, routeData, heightData, radius, phase, controls, particles, audio ) {

		if( heightData.length === 0 ) {
			console.warn("No height data for route ", routeData.meta.name );
		}

        this.name = routeData.meta.name || "";
        this._routeData = calc3DPositions( routeData.gps, heightData, radius+Config.globus.material.displacementScale/2 );

		this._cityMarkers = [];
		this._routeLine;
		this.line = null;

		this.active = null;
		this._container = container;
		this._domEvents = domEvents;

		this.heightData = [];
		this.phase = phase; // which color out of 2xPI
		this.steps = 1.1; // how fast change the color

		this.meshGroup = new THREE.Object3D();
		this.lightGroup = new THREE.Object3D();
		this.spriteGroup = new THREE.Object3D();
		this.sprites = [];
		this.marker = [];

		this._isVisible = false;
		this._showLabels = true;

		this._animate = false;
		this._currentInfoBox = 0;
		this.drawCount = 0;
		this._vertices = 0;

        this.group	= new THREE.Group();
		scene.add( this.group );

		const markergeo = new THREE.SphereGeometry(1, 8, 6);
		const markerMaterial = new THREE.MeshLambertMaterial();
		this._markermesh = new THREE.Mesh(markergeo, markerMaterial);

        this._createRoute( this._routeData, this.group, this.phase, this.steps, controls, particles, audio );
		this._vertices = this._routeLine.numberVertices;
	}


	get showLabels() {
		return this._showLabels;
	}

	set showLabels( value ) {
		this._showLabels = value;
		// this.marker.forEach(marker => {marker.sprite.isVisible = value });
		this.marker.forEach(marker => {marker._label.isVisible = value });
	}

	get isVisible() {
		return this._isVisible;
	}
	set isVisible( value ) {
		this.marker.forEach(marker => {marker.isVisible = value });
		this.lightGroup.visible = value; 
		this.line.visible = value; 
		
		this._isVisible = value;
	}

    update( delta, camera ) {

		// resolution set not in loop necessary 
		// 	if( this.line.material.resolution !== undefined ) {
		// 		this.line.material.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport
		// 	}
		
		// hide occluded, scale on zoom
		let i = this.marker.length - 1;
		for ( ; i >= 0 ; i -- ) {
			this.marker[i].update( camera, delta );
		}

		if ( this._animate === true ) {
			this.animate( this._controls );		
		}
	}
	
	get pois() {
		return this._cityMarkers;
	}

    _createRoute( routeData, group, phase, steps, controls, particles, listener ) {

		this._controls = controls;

		var currentCoordinate;
		var color = new THREE.Color();
		var marker;
		var sprite;

		var phase = phase;
		var steps = steps;
		var frequency = 1 /  ( steps * routeData.length );

		this._routeLine = new RouteLine( Config.routes.lineSegments );

		let quickdirty = [];
		routeData.forEach((currentCoordinate, index) => {
			if ( ! currentCoordinate.adresse ) { return; }
			quickdirty.push ( currentCoordinate );
		});

		routeData.forEach((currentCoordinate, index) => {
			// the json looks like this: {"adresse":"Iran","externerlink":"http:\/\/panoreisen.de\/156-0-Iran.html","lng":"51.42306","lat":"35.69611"}
			if(index > 0) {
				this._routeLine.connectGeometry( routeData[index-1].displacedPos, currentCoordinate.displacedPos);
			}
			// DONT DRAW MARKER WHEN THEY HAVE NO NAME
			if ( ! currentCoordinate.adresse ) { return; }
			
			this._cityMarkers.push ( currentCoordinate );

			// CREATE MARKER
			color.set( makeColorGradient( index, frequency, undefined, undefined, phase ) );

			marker = new Marker(color, currentCoordinate.displacedPos.clone(), this._markermesh, this, controls, particles, listener);
			this.marker.push(marker);
			this.meshGroup.add( marker.mesh );

			// function createLight (positionVec3, color, intensity) {
			// 	var light = new THREE.PointLight(color, intensity, 8);
			// 	var lightPos = positionVec3.multiplyScalar(1.03); //place light a little bit above the markers
			// 	light.position.copy(lightPos);
		
			// 	// var helper = new THREE.PointLightHelper( light, light.distance );
			// 	// helper.update();
			// 	// scene.add( helper );
			// 	return light;
			// }
			        
			// const light = createLight(marker.mesh.position.clone(), color, 2);
			// this.lightGroup.add( light );

			//MAKE MARKER CLICKABLE
			marker.linkify( this, currentCoordinate.lat, currentCoordinate.lon );

			
			// CREATE LABELS FOR MARKER
			const name = currentCoordinate.countryname || currentCoordinate.adresse;
			const text = this._cityMarkers.length + " " + name;
			marker.getLabel( this._container, text, this.showLabels, controls );
			// sprite = marker.getSprite(text, marker.mesh.position, this.showLabels);
			// this.spriteGroup.add ( sprite.sprite );
			// this.sprites.push( sprite );

			// CREATE LIGHTS FOR BLOBS
			// when using lights wait for the route to be loaded!
			// var intensity = 1;
			// var light = this._markerFactory.createLight( currentCoordinate.displacedPos.clone(), color, intensity );
			// this.lightGroup.add( light );

		})

		this.marker[this.marker.length-1].last = true;

		this.marker.forEach( (marker, index) => {

			if( index !== 0 ) {
				marker.previous = this.marker[index-1]
			}
			if ( index !== this.marker.length-1 ) {
				marker.next = this.marker[index+1];
			}

			// CREATE HUDLABELS FOR MARKER
			marker.getInfoBox( this._container, this._cityMarkers[ index ], this );
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

	// toggleAnimate( scope ) {

	// 	var that = scope || this;

	// 	if ( that._animation === false ) {

	// 		that.startAnimate();

	// 	} else {

	// 		that.pauseAnimate();

	// 	}

	// }

	get runAnimation() {
		return this._animate;
	}

	set runAnimation( value ) {

		this._animate = value;
		this.showLabels = !value;

		if( value === false ) {
			// stop animation
			this.drawCount = 0;
			this.line.geometry.setDrawRange( 0, this._vertices );
			if( this.active !== null ) {
				this.active.active = false;
			}
		} else {
			if(this.active === null) {
				this.active = this._cityMarkers[0];
			}
		}

	}

	// startAnimate() {

	// 	this._animation = true;
	// 	this.showLabels = false;

	// 	for ( var i = 0; i < this.meshGroup.children.length; i ++ ) {

	// 		if ( this._currentInfoBox > i ) {

	// 			this.meshGroup.children[ i ].visible = true;

	// 		}
	// 		else {

	// 			this.meshGroup.children[ i ].visible = false;

	// 		}
			
	// 	}

	// }

	set pauseAnimation( value ) {
		this._animate = !value;
	}

	reset() {

		this.stopAnimate();
		if( controls.rotateToCoordinate instanceof Function ){
			controls.rotateToCoordinate( this._routeData[ 0 ].lat, this._routeData[ 0 ].lng );
		}

		if ( this._markerFactory.active !== null ) {
			// close open infoBoxes
			this._markerFactory.active._3xDomEvent.clickHandlers[ 0 ].callback();
			
		}

	}
	
	animate( controls ) {

		var drawCallCityIndex = this._routeData.indexOf( this.pois[ this._currentInfoBox ] ) * this._routeLine.segments;
		var drawCallCityIndexBefore = this._routeData.indexOf( this._cityMarkers[ this._currentInfoBox - 1 ] ) * this._routeLine.segments;
		var closeDelay = this._routeLine.segments * 5 + drawCallCityIndexBefore;

			if ( this.drawCount === drawCallCityIndex )
			{
				// this.meshGroup.children[ this._currentInfoBox ].visible = true;
				this.pois[this._currentInfoBox].active = true;
				// this.active.active = true;
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
			this.drawCount = ( this.drawCount + 0.5 ) % ( this._vertices );
		/*
			if( controls.rotateToCoordinate instanceof Function ){
				// "camera" follows route
				var lat = this._routeData[ Math.floor( this.drawCount / this._routeLine.segments ) ].lat;
				var lng = this._routeData[ Math.floor( this.drawCount / this._routeLine.segments ) ].lng;
				// present the starting point on load to the user
				controls.rotateToCoordinate ( lat, lng );
			}
			// controls.rotateToCoordinate ( lat, lng );
			// debug
			// this.box.innerHTML = this.drawCount + "<br>vertices: " + this.vertices + "<br>indexBefore: " + drawCallCityIndexBefore + "<br>drawCallCityIndex: " + drawCallCityIndex;
		*/

	}

}