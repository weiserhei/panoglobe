/**
 * Route Class
 * depends on Marker and RouteLine
 * create the Route
 */

import { SphereBufferGeometry, MeshLambertMaterial, Mesh, Color } from "three";

import Config from './../../data/config';

import { calc3DPositions, createSphereArc } from "./../utils/panoutils";
import { makeColorGradient } from "./../utils/colors";
import RouteLine from "./routeLine.js";
import Marker from "./marker";

export default class Route {
    constructor( scene, container, domEvents, routeData, heightData, radius, phase, controls ) {

		if( heightData.length === 0 ) {
			console.warn("No height data for route ", routeData.meta.name );
        }

        this._controls = controls;

        this.name = routeData.meta.name || "";
        this._routeData = calc3DPositions( routeData.gps, heightData, radius + 0.3 );

		this._cityMarkers = [];
        this._routeLine = new RouteLine();
		this.line = null; //please remove me

		this._activeMarker = null;
		this.manager;

		this._container = container;
		this._domEvents = domEvents;

		this.heightData = [];
		this.phase = phase; // which color out of 2xPI
		this.steps = 1.2; // how fast change the color (0 = fast)

		this.marker = [];

		this._isVisible = false;
		this._showLabels = true;

        this._animate = false;
        this._currentInAnimation;

		const markergeo = new SphereBufferGeometry(1, 8, 6);
		const markerMaterial = new MeshLambertMaterial();
		this._markermesh = new Mesh(markergeo, markerMaterial);

        this._createRoute( this._routeData, scene, this.group, this.phase, this.steps, controls );

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
		
        this.marker.forEach(marker => { marker.update( camera, delta ); });
        
        // test
        // this._routeLine.updateColors( delta );

		if ( this._animate === true ) {
			this._animateRoute(delta);
		}
	}
	
	get pois() {
		return this._cityMarkers;
	}

    _createRoute( routeData, scene, group, phase, steps, controls ) {

		let marker;
		const color = new Color();
        const frequency = 1 /  ( steps * routeData.length );
        let vertices = [];
                
		routeData.forEach((currentCoordinate, index) => {
			// the json looks like this: {"adresse":"Iran","externerlink":"http:\/\/panoreisen.de\/156-0-Iran.html","lng":"51.42306","lat":"35.69611"}
			// vertices.push(currentCoordinate.displacedPos);
			if(index > 0) {
				const curve = createSphereArc( routeData[index-1].displacedPos, currentCoordinate.displacedPos );
				vertices.push(...curve.getPoints( Config.routes.lineSegments ));
            }
			// DONT DRAW MARKER WHEN THEY HAVE NO NAME
			if ( ! currentCoordinate.adresse ) { return; }
			
            this._cityMarkers.push ( currentCoordinate );
            
            // currentCoordinate.index = index;
			// CREATE MARKER
			color.set( makeColorGradient( index, frequency, undefined, undefined, phase ) );
            
			marker = new Marker(color, currentCoordinate, currentCoordinate.displacedPos.clone(), this._markermesh, this, controls);
            marker.index = index;
			this.marker.push(marker);
			// this.meshGroup.add( marker.mesh );
			scene.add( marker.mesh );

			currentCoordinate.marker = marker;

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

        // todo refactor this shit
        if(Config.routes.linewidth > 1) {
			this.line = this._routeLine.getThickLine( vertices, steps, phase, Config.routes.linewidth, true );            
        } else {
            this.line = this._routeLine.getColoredBufferLine( vertices, steps, phase );
        }
		scene.add( this.line );
		
        //Create a closed wavey loop
        // let x = this._routeData.map(a => a.displacedPos);
        // var curve = new THREE.CatmullRomCurve3(x);
        // var points = curve.getPoints( this._routeData.length * 10 );
        // var geometry = new THREE.BufferGeometry().setFromPoints( points );

        // var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
        // Create the final object to add to the scene
        // var curveObject = new THREE.Line( geometry, material );
        // scene.add(curveObject);

        // vertices = [
        //     new Vector3(70, 77, -9),
        //     new Vector3(70, 77, 0),
        //     new Vector3(80, 77, 10),
        //     new Vector3(70, 80, 20),
        //     new Vector3(70, 75, 25),
        // ];

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

	}

	get runAnimation() {
		return this._animate;
	}

	set runAnimation( value ) {

		this._animate = false;
		this.showLabels = !value;
		this._drawCount = 0;
		
		if( value === false ) {
			// stop animation
			this._routeLine._drawCount = 0;
			this._routeLine.drawFull();

			if( this.activeMarker !== null ) {
				this.activeMarker.active = false;
			}
		} else {
            // this._routeLine.drawFull();
            this._routeLine.drawCount = 0;

			this._controls.moveIntoCenter( 
                this.pois[0].lat, this.pois[0].lng, 1000, undefined, undefined, () => { 
                    // this._routeData[ 0 ].marker.active = true;
                    // setTimeout(() => { this._animate = true; }, 500);
                    this._animate = true;
                    } 
                );
		}

	}

	set pauseAnimation( value ) {
		this._animate = !value;
    }
	
	_animateRoute(delta) {
		let speed = delta * 60;
		
        // let currentCoordinate = Math.floor( ( this._drawCount / (Config.routes.lineSegments+1) ) );
        // divider must be in the range of routeData.length
		const divider = this._drawCount /  ( this._routeLine.numberVertices / this._routeData.length );
        let currentCoordinate = Math.floor( divider );
        // if( currentCoordinate > 1 && this._routeData[ currentCoordinate ].marker !== undefined ) {
        if( this._routeData[ currentCoordinate ].marker !== undefined ) {

            if( this._currentInAnimation !== this._routeData[ currentCoordinate ].marker) {
                this._currentInAnimation = this._routeData[ currentCoordinate ].marker;
                if(this.activeMarker !== null) {
                    this.activeMarker.active = false;
                }
                this._routeData[ currentCoordinate ].marker.active = true;
                setTimeout(() => { if(this.activeMarker !== null) this.activeMarker.active = false; }, 2000);
                const index = this._routeData[ currentCoordinate ].marker.index;
                if( this._routeData[ currentCoordinate ].marker.next !== undefined ) {
                    const nextIndex = this._routeData[ currentCoordinate ].marker.next.index;
                    const diff = nextIndex - index;
                    // todo: kill slow tween when buttons are pressed
                    this._controls.moveIntoCenter( this.activeMarker.next._poi.lat, this.activeMarker.next._poi.lng, 200 * diff, Config.easing, 250 );
                }

            }
            // fake slow down on marker
            speed = delta * 10;
        }


        // follow endpoint when last active POI is 50 units behind
        const lastMarkerIndex = this._routeData.findIndex( currCo => { return this._currentInAnimation === currCo.marker } );
		if( currentCoordinate > lastMarkerIndex + 50 ) {
			// if(this.activeMarker !== null) {
			// 	if( this.activeMarker.next !== undefined ) {
			// 		// move camera to next marker in advance
					// this._controls.moveIntoCenter( this.activeMarker.next._poi.lat, this.activeMarker.next._poi.lng, 1000 );
					this._controls.moveIntoCenter( this._routeData[currentCoordinate].lat, this._routeData[currentCoordinate].lng, 200, Config.easing, 300 );
			// 	}
			// 	// this.activeMarker.active = false;
            // }
        }

        this._routeLine.update(speed);
		
		// this._drawCount = ( this._drawCount + 1 ) % this._routeLine.numberVertices;
		this._drawCount = this._routeLine.drawCount;
        // dont repeat
        // console.log( this._drawCount, this._routeLine.numberVertices );
		if( this._drawCount >= this._routeLine.numberVertices - Config.routes.lineSegments) {
            this.runAnimation = false;
            const lastMarker = this.pois[this.pois.length-1];
            this._controls.moveIntoCenter( lastMarker.lat, lastMarker.lng, 1000, Config.easing, 400 );
		}

	}

}