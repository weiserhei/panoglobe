/**
 * Draw a the route line on the globe
 * uses one Buffer Geometry Line or
 * uses merged THREE.Line geometry
 */

import * as THREE from "three";
import {LineGeometry, LineMaterial, Line2} from 'three-full';

import { makeColorGradient } from "../../utils/colors";
import { createSphereArc } from "../../utils/panoutils";


export default class RouteLine {
    constructor( lineSegments ) {

		this._segments = lineSegments; // how many line segments

		this._lineMergeGeometry = new THREE.Geometry();
		this._line;

		this.positions;
		this.colors;

		this._numberVertices = 0;

		this._drawCount = 0;

	}

	get segments() {
		return this._segments;
	}

	get line() {
		return this._line;
	}

	get numberVertices() {
		return this._numberVertices;
	}

	get drawCount() {
		return this._drawCount;
	}

	update() {
		// http://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically/31411794#31411794
		if( this._line.geometry instanceof THREE.BufferGeometry) {
			this._line.geometry.setDrawRange( 0, this._drawCount );
		} else if ( this._line.geometry instanceof LineGeometry ) {
			// Thick Line
			this._line.geometry.maxInstancedCount = this._drawCount -1;
		}

		// drawCount must be all vertices
		this._drawCount = ( this._drawCount + 1 ) % ( this._numberVertices );	
	}

	drawFull() {

		if( this._line.geometry instanceof LineGeometry ) {
			// thick line
			this._line.geometry.maxInstancedCount = this._numberVertices - 1;
		} else if( this.line.geometry instanceof THREE.BufferGeometry ) {
			this.line.geometry.setDrawRange( 0, this._numberVertices );
		}

	}

	_build( steps, phase ) {
		// calculate Positions and Colors
		// based on steps and color phase

        const numberVertices = this._numberVertices = this._lineMergeGeometry.vertices.length;
		const color = new THREE.Color();
		const frequency = 1 /  ( steps * numberVertices );

		this.positions = new Float32Array( numberVertices * 3 ); // 3 vertices per point
		this.colors = new Float32Array( numberVertices * 3 );

		this._lineMergeGeometry.vertices.forEach((vertice, i) => {

		    this.positions[ i * 3 ] = vertice.x;
		    this.positions[ i * 3 + 1 ] = vertice.y;
		    this.positions[ i * 3 + 2 ] = vertice.z;

			color.set ( makeColorGradient( i, frequency, undefined, undefined, phase ) );

			this.colors[ i * 3 ] = color.r;
			this.colors[ i * 3 + 1 ] = color.g;
			this.colors[ i * 3 + 2 ] = color.b;

		});

        // var points2 = hilbert3D( new THREE.Vector3( 0, 0, 120 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );
        // var points = routeData.map(pos => { return new THREE.Vector3(pos.displacedPos.x, pos.displacedPos.y, pos.displacedPos.z) });

        // var spline = new THREE.CatmullRomCurve3( points );
        // var divisions = Math.round( 10 * points.length );
        // var color = new THREE.Color();
        // for ( var i = 0, l = divisions; i < l; i ++ ) {
        //     var point = spline.getPoint( i / l );
        //     positions.push( point.x, point.y, point.z );
        //     color.setHSL( i / l, 1.0, 0.5 );
        //     colors.push( color.r, color.g, color.b );
        // }
	}
    
    getThickLine( steps, phase, linewidth ) {

		this._build( steps, phase );

        const geometry = new LineGeometry();
        geometry.setPositions( this.positions );
		geometry.setColors( this.colors );
		
        const lineMaterial = new LineMaterial( {
            color: 0xffffff,
            linewidth: linewidth, // in pixels
            vertexColors: THREE.VertexColors,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
            //resolution:  // to be set by renderer, eventually
            dashed: false
		} );
		
        this._line = new Line2( geometry, lineMaterial );
		// this.line.computeLineDistances();

		// render "on top"
		// interferes with atmosphere material
		// this.line.renderOrder = 999;
		// this.line.onBeforeRender = function( renderer ) { 
		// 	renderer.clearDepth(); 
		// };
		
		//window.addEventListener('resize', () => { this.line.material.resolution.set( window.innerWidth, window.innerHeight ); }, false);
		// this.line.material.resolution.set( window.innerWidth, window.innerHeight );

        return this._line;
    }

	
	getColoredBufferLine( steps, phase ) {

		this._build( steps, phase );

		// geometry
		const geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( this.positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( this.colors, 3 ) );

		// material
		const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

		// line
		this._line = new THREE.Line( geometry, lineMaterial );

		return this._line;

	}

	connectGeometry( from, to ) {

		const curve = createSphereArc( from, to );
		const lineGeometry = new THREE.Geometry();
		lineGeometry.vertices = curve.getPoints( this._segments ); // how many vertices do we want on this guy? this is for *each* side
		// lineGeometry.computeLineDistances();
		this._lineMergeGeometry.merge( lineGeometry );

	}

	// DEPRECATED
	// create line with basic geometry
	// getColoredLine( steps, phase ) {
		
	// 	let numberVertices = this._lineMergeGeometry.vertices.length;
	// 	this.colors = [];
	// 	var frequency = 1 /  ( steps * numberVertices );
	// 	var color = new THREE.Color();
		
	// 	this._lineMergeGeometry.vertices.forEach((vertice, i) => {
	// 		this.colors[ i ] = color.clone();
	// 		color.set ( makeColorGradient( i, frequency, undefined, undefined, phase ) );
	// 	})

	// 	let lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
	// 	this.line = new THREE.Line( this._lineMergeGeometry, lineMaterial );

	// 	return this.line;

	// }

}