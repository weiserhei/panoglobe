/**
 * Route Class
 * depends on Marker and RouteLine
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

		// this.active = null;
		this._activeMarker = null;
		this.manager;

		this._container = container;
		this._domEvents = domEvents;

		this.heightData = [];
		this.phase = phase; // which color out of 2xPI
		this.steps = 1.1; // how fast change the color

		this.marker = [];

		this._isVisible = false;
		this._showLabels = true;

		this._animate = false;
		this._currentInfoBox = 0;

		const markergeo = new THREE.SphereGeometry(1, 8, 6);
		const markerMaterial = new THREE.MeshLambertMaterial();
		this._markermesh = new THREE.Mesh(markergeo, markerMaterial);

        this._createRoute( this._routeData, scene, this.group, this.phase, this.steps, controls, particles, audio );

	}

	get activeMarker() {
		return this._activeMarker;
	}
	set activeMarker( value ) {
		this._activeMarker = value;
		if( this.manager !== undefined ) {
			this.manager.activeMarker = value;
		}
	}

	get showLabels() {
		return this._showLabels;
	}

	set showLabels( value ) {
		this._showLabels = value;
		this.marker.forEach(marker => {marker.label.isVisible = value });
	}

	get isVisible() {
		return this._isVisible;
	}
	set isVisible( value ) {
		this.marker.forEach(marker => {marker.isVisible = value });
		this.line.visible = value; 
		
		this._isVisible = value;
	}

    update( delta, camera ) {
		
		// hide occluded, scale on zoom
		let i = this.marker.length - 1;
		for ( ; i >= 0 ; i -- ) {
			this.marker[i].update( camera, delta );
		}

		if ( this._animate === true ) {
			this.animate();	
			this._routeLine.update();
		}
	}
	
	get pois() {
		return this._cityMarkers;
	}

    _createRoute( routeData, scene, group, phase, steps, controls, particles, listener ) {

		let marker;
		const color = new THREE.Color();
		const frequency = 1 /  ( steps * routeData.length );

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

			marker = new Marker(color, currentCoordinate, currentCoordinate.displacedPos.clone(), this._markermesh, this, controls, particles, listener);
			this.marker.push(marker);
			// this.meshGroup.add( marker.mesh );
			scene.add( marker.mesh );

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
			marker.linkify( this, currentCoordinate.lat, currentCoordinate.lng );

			// CREATE LABELS FOR MARKER
			const name = currentCoordinate.countryname || currentCoordinate.adresse;
			const text = this._cityMarkers.length + " " + name;
			marker.getLabel( this._container, text, this.showLabels, controls );

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

			scene.add( this.line );

			// length of the line
			// this.vertices = coloredLine.geometry.getAttribute('position').array.length;
			// this.vertices = this._routeLine.vertices;

			// callback( coloredLine, this.meshGroup, this.spriteGroup, this.lightGroup );

			// if( controls.rotateToCoordinate instanceof Function ){
			// 	// present the starting point on load to the user
			// 	controls.rotateToCoordinate ( routeData[ 0 ].lat, routeData[ 0 ].lng );
			// }


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

	get runAnimation() {
		return this._animate;
	}

	set runAnimation( value ) {

		this._animate = value;
		this.showLabels = !value;

		if( value === false ) {
			// stop animation

			this.drawCount = 0;
			// thick line
			this._routeLine.drawFull();

			if( this.activeMarker !== null ) {
				this.activeMarker.active = false;
			}
		} else {
			if(this.activeMarker === null) {
				this.activeMarker = this._cityMarkers[0];
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
	
	animate() {

		/*
		var drawCallCityIndex = this._routeData.indexOf( this.pois[ this._currentInfoBox ] ) * this._routeLine.segments;
		var drawCallCityIndexBefore = this._routeData.indexOf( this.pois[ this._currentInfoBox - 1 ] ) * this._routeLine.segments;
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
			*/

		
			// if( controls.rotateToCoordinate instanceof Function ){
			// 	// "camera" follows route
			// 	var lat = this._routeData[ Math.floor( this.drawCount / this._routeLine.segments ) ].lat;
			// 	var lng = this._routeData[ Math.floor( this.drawCount / this._routeLine.segments ) ].lng;
			// 	// present the starting point on load to the user
			// 	controls.rotateToCoordinate ( lat, lng );
			// }
			// controls.rotateToCoordinate ( lat, lng );
			// debug
			// this.box.innerHTML = this.drawCount + "<br>vertices: " + this.vertices + "<br>indexBefore: " + drawCallCityIndexBefore + "<br>drawCallCityIndex: " + drawCallCityIndex;
		

	}

}