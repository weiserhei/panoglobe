/**
 * Route Class
 * depends on MarkerFactory and RouteLine
 * Load the JSON routedata
 * create the Route
 */

import * as THREE from "three";

import Config from '../../data/config';

import { calc3DPositions, numberWithCommas } from "../../utils/panoutils";
import { makeColorGradient } from "../../utils/colors";

import RouteLine from "./routeLine";
import TextSprite from "./textSprite";

export default class Route {
    constructor( scene, container, domEvents, routeData, heightData, radius, phase ) {

        this.name = routeData.meta.name || "";
        this._routeData = calc3DPositions( routeData.gps, heightData, radius+Config.globus.material.displacementScale/2 );

		this._cityMarkers = [];
		this._routeLine = null;

		this.active = null;
		this._container = container;
		this._domEvents = domEvents;

		this.heightData = [];
		this.phase = phase; // which color out of 2xPI
		this.steps = 1.1; // how fast change the color

		this.meshGroup = new THREE.Object3D();
		this.lightGroup = new THREE.Object3D();
		this.spriteGroup = new THREE.Object3D();
		this.line = null;
		this.sprites = [];

		this.isVisible = false;
		this.showLabels = true;

		this._animation = false;
		this._currentInfoBox = 0;
		this.drawCount = 0;
		this.vertices = 0;


        this.group	= new THREE.Group();
		scene.add( this.group );

		const markergeo = new THREE.SphereGeometry(1, 8, 6);
		const markerMaterial = new THREE.MeshLambertMaterial();
		this._markermesh = new THREE.Mesh(markergeo, markerMaterial);

        this._createRoute( this._routeData, this.group, this.phase, this.steps );

    }

    update( delta, camera ) {
        if( this.line.material.resolution !== undefined ) {
            this.line.material.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport
		}
		
		// hide occluded, scale on zoom
		this._updateLabel( camera );

		// if ( this._animation === true ) {
		// 	this.animate( controls );		
		// }

	}
	
	get pois() {
		return this._cityMarkers;
	}

	_getMarker(position, color) {
        const marker = this._markermesh.clone();
        marker.material = this._markermesh.material.clone();
        const hsl = color.getHSL({});
        //LOWER SATURATION FOR BLOBS
        hsl.s -= 0.2;
        marker.material.color.setHSL(hsl.h, hsl.s, hsl.l);
        // marker.material.uniforms.diffuse.value.setHSL ( hsl.h, hsl.s, hsl.l );
        //LOWER BRIGHTNESS FOR EMISSIVE COLOR
        hsl.l -= 0.3;
        // marker.material.uniforms.emissive.value.setHSL ( hsl.h, hsl.s, hsl.l );
        marker.material.emissive.setHSL(hsl.h, hsl.s, hsl.l);
        // var ohgodwhy = position.clone();
        // ohgodwhy.y += markermesh.geometry.parameters.height / 10; // pyramid geometry
        marker.position.copy(position); // place marker
        // marker.lookAt( globe.mesh.position );
        const outlineMaterial2 = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.BackSide });
        const outlineMesh2 = new THREE.Mesh(marker.geometry, outlineMaterial2);
        outlineMesh2.scale.multiplyScalar(1.3);
        outlineMesh2.visible = false;
        marker.add(outlineMesh2);
        return marker;
	}

	_getInfoBox(city, marker) {
        const lng = (Math.round(city.lng * 100) / 100).toFixed(2);
        const lat = (Math.round(city.lat * 100) / 100).toFixed(2);
        const box = document.createElement('div');
        let text = "<div class='labelHead'>";
        text += "<b>" + city.adresse + "</b>";
        text += " (" + numberWithCommas(Math.floor(city.hopDistance)) + " km)";
        text += "</div>";
        text += "<div class='labelContent'>";
        text += "<p>Lat: " + lat + " | Long: " + lng + "</p>";
        text += "<p><a href='" + city.externerlink + "' target='_blank'><i class='fas fa-external-link-alt'></i> Point of Interest</a></p>";
        text += "</div>";
        text += "<div class='arrow'></div>";
        box.innerHTML = text;
        box.className = "hudLabel";
        box.style.display = "none";

		const button = document.createElement("button");
		button.className = "btn btn-sm btn-danger closeButton";
		button.innerHTML = '<i class="fas fa-times"></i>';
		box.appendChild(button);

		// close label on X click
		button.addEventListener("click", ()=>{
			box.style.display = "none";
			box.classList.remove("fadeIn");
			// hide outline mesh
			marker.children[0].visible = false;
			this.active = null;
		});

        return box;
	}
	
	_linkify(mesh, domElement, lat, lon) {
        var that = this;
        var eventTarget = mesh;
        var infoBox = domElement || undefined;

        function handleClick(event) {
            function cleanUp() {
                if (that.active.infoBox !== undefined) {
                    // cleanup CSS
                    that.active.infoBox.style.display = "none";
                    that.active.infoBox.classList.remove("fadeIn");
                }
                // hide outline mesh
                that.active.children[0].visible = false;
            }
            // Hide the infoBox when itself is clicked again
            if (that.active === mesh) {
                cleanUp();
                that.active = null;
                return;
            }
            // if (this._controls.rotateToCoordinate instanceof Function) {
            if (this._controls !== undefined) {
                // todo
                // modify current rotation, dont overwrite it!
                // center clicked point in the middle of the screen
                controls.rotateToCoordinate(lat, lng);
            }
            if (that.active !== null) {
                // Cleanup when the user clicked another marker 
                // without deselecting the last
                cleanUp();
            }
            that.active = mesh;
            if (that.active.infoBox !== undefined) {
                infoBox.style.display = "block";
                infoBox.classList.add("fadeIn");
            }
            mesh.children[0].visible = true;
        }
        // this._domEvents.addEventListener( eventTarget, 'click', handleClick, false);
        this._domEvents.bind(eventTarget, 'click', handleClick, false);
        // this._domEvents.bind( eventTarget, 'touchend', handleClick );
        // bind 'mouseover'
        this._domEvents.addEventListener(eventTarget, 'mouseover', function (event) {
            // do nottin' when route is hidden
            if (mesh.parent.visible === false) {
                return;
            }
            document.body.style.cursor = 'pointer';
            mesh.children[0].visible = true;
        }, false);
        this._domEvents.bind(eventTarget, 'mouseout', function (event) {
            if (that.active !== mesh) {
                mesh.children[0].visible = false;
            }
            document.body.style.cursor = 'default';
        }, false);
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
			color.set( makeColorGradient( index, frequency, undefined, undefined, phase ) );
			marker = this._getMarker( currentCoordinate.displacedPos.clone(), color );
			this.meshGroup.add( marker );

			// CREATE HUDLABELS FOR MARKER
			infoBox = this._getInfoBox( currentCoordinate, marker );
			this._container.appendChild(infoBox);
			// used to update the position
			marker.infoBox = infoBox;

			//MAKE MARKER CLICKABLE
			this._linkify( marker, infoBox, currentCoordinate.lat, currentCoordinate.lon );

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
		
	}
	
	hide() {
		
		this.meshGroup.visible = false; 
		this.lightGroup.visible = false; 
		this.spriteGroup.visible = false; 
		this.line.visible = false; 
		
		this.isVisible = false;
		
	}

	toggleAnimate( scope ) {

		var that = scope || this;

		if ( that._animation === false ) {

			that.startAnimate();

		} else {

			that.pauseAnimate();

		}

	}

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

	}

	pauseAnimate() {

		this._animation = false;

	}

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

	}

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

					if( this.active !== null ) { 
						// hide marker when overlay is active
						this.active.sprite.update( ocluded, eye, false, dot );
					}

					//IF BLOBS VISIBLE: SET BLOB+SPRITE VISIBLE AND SCALE ACCORDING TO ZOOM LEVEL
					if ( !ocluded ) {
						this.meshGroup.children[ i ].scale.set( 1, 1, 1 ).multiplyScalar( 0.2 + ( eye.length() / 600 ) ); // SCALE SIZE OF BLOBS WHILE ZOOMING IN AND OUT // 0.25 * (eye.length()/60

						if( this.active !== null ) {

							this.active.infoBox.style.display = "block";
							this.active.infoBox.classList.add("fadeIn");
							this.active.children[0].visible = true;

							// overlay is visible
							_screenVector.set(0, 0, 0);
							this.active.localToWorld(_screenVector);
							_screenVector.project(camera);

							var posx = Math.round((_screenVector.x + 1) * this._container.offsetWidth / 2);
							var posy = Math.round((1 - _screenVector.y) * this._container.offsetHeight / 2);

							var boundingRect = this.active.infoBox.getBoundingClientRect();
							this.active.infoBox.style.left = (posx - boundingRect.width - 28) + 'px';
							this.active.infoBox.style.top = (posy - 23) + 'px';

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