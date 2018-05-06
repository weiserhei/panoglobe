/**
 * Draw a the route line on the globe
 * uses one Buffer Geometry Line or
 * uses merged THREE.Line geometry
 */

import * as THREE from "three";

import * as colorUtils from "../../utils/colors";
import * as Panoutils from "../../utils/panoutils";

import {LineGeometry, LineMaterial, Line2, hilbert3D} from 'three-full';

// 'use strict';
export default class RouteLine {
    constructor() {

		this.lineMergeGeometry = new THREE.Geometry();
		this.lineMaterial = new THREE.LineBasicMaterial();
		this.from = null;
		this.segments = 10;
		this.vertices = 0;

    }
    
    thickLine( routeData, steps, phase, linewidth ) {

        var segments = this.lineMergeGeometry.vertices.length;
		// this.vertices = segments / ( this.segments * 3 );
        this.vertices = segments;
        
        // Position and Color Data
        var positions = [];
        var colors = [];

        // attributes
		var positions = new Float32Array( segments * 3 ); // 3 vertices per point
		var colors = new Float32Array( segments * 3 );

		var frequency = 1 /  ( steps * this.lineMergeGeometry.vertices.length );
		var color = new THREE.Color();

		var x, y, z;

		for ( var i = 0, l = segments; i < l; i ++ ) {

			x = this.lineMergeGeometry.vertices[ i ].x;
			y = this.lineMergeGeometry.vertices[ i ].y;
			z = this.lineMergeGeometry.vertices[ i ].z;

		    positions[ i * 3 ] = x;
		    positions[ i * 3 + 1 ] = y;
		    positions[ i * 3 + 2 ] = z;

		    // color.clone();
		    color.set ( colorUtils.makeColorGradient( i, frequency, undefined, undefined, phase ) );

			colors[ i * 3 ] = color.r;
			colors[ i * 3 + 1 ] = color.g;
			colors[ i * 3 + 2 ] = color.b;

        }

        var points2 = hilbert3D( new THREE.Vector3( 0, 0, 120 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );
        var points = routeData.map(pos => { return new THREE.Vector3(pos.displacedPos.x, pos.displacedPos.y, pos.displacedPos.z) });

        // var spline = new THREE.CatmullRomCurve3( points );
        // var divisions = Math.round( 10 * points.length );
        // var color = new THREE.Color();
        // for ( var i = 0, l = divisions; i < l; i ++ ) {
        //     var point = spline.getPoint( i / l );
        //     positions.push( point.x, point.y, point.z );
        //     color.setHSL( i / l, 1.0, 0.5 );
        //     colors.push( color.r, color.g, color.b );
        // }
        // THREE.Line2 ( LineGeometry, LineMaterial )
        // var geometry = new THREE.BufferGeometry();
        // geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        // geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        
        var geometry = new LineGeometry();
        geometry.setPositions( positions );
        geometry.setColors( colors );
        this.matLine = new LineMaterial( {
            color: 0xffffff,
            linewidth: linewidth, // in pixels
            vertexColors: THREE.VertexColors,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        this.line = new Line2( geometry, this.matLine );
        this.line.computeLineDistances();
        // scene.add( this.line );

        return this.line;
    }

	connect( to ) {

		if( this.from === null ){
			//catch first call
			this.from = to;
			return;
		}
		
		var curve = Panoutils.createSphereArc( this.from.displacedPos, to.displacedPos );
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices = curve.getPoints( this.segments - 1 ); //	how many vertices do we want on this guy? this is for *each* side
		// lineGeometry.computeLineDistances();

		this.lineMergeGeometry.merge( lineGeometry );

		this.from = to;

	}

	getColoredLine( steps, phase ) {
		
		var vertexColors = [];
		var frequency = 1 /  ( steps * this.lineMergeGeometry.vertices.length );
		var color = new THREE.Color();
		
		for ( var i = 0; i < this.lineMergeGeometry.vertices.length; i ++ ) {

			vertexColors[ i ] = color.clone();
			color.set ( colorUtils.makeColorGradient( i, frequency, undefined, undefined, phase ) );

			// vertexColors[ i ].setHSL( i / routeData.length, 1.0, 0.5 );

		}

		this.lineMergeGeometry.colors = vertexColors;

		var coloredLine = new THREE.Line( this.lineMergeGeometry, this.lineMaterial );
		coloredLine.material.vertexColors = THREE.VertexColors;

		return coloredLine;

	};

	getColoredBufferLine( steps, phase ) {

		var segments = this.lineMergeGeometry.vertices.length;
		// this.vertices = segments / ( this.segments * 3 );
		this.vertices = segments;

		// geometry
		var geometry = new THREE.BufferGeometry();

		// material
		var material = this.lineMaterial;
		material.vertexColors = THREE.VertexColors;

		// attributes
		var positions = new Float32Array( segments * 3 ); // 3 vertices per point
		var colors = new Float32Array( segments * 3 );

		var frequency = 1 /  ( steps * this.lineMergeGeometry.vertices.length );
		var color = new THREE.Color();

		var x, y, z;

		for ( var i = 0, l = segments; i < l; i ++ ) {

			x = this.lineMergeGeometry.vertices[ i ].x;
			y = this.lineMergeGeometry.vertices[ i ].y;
			z = this.lineMergeGeometry.vertices[ i ].z;

		    positions[ i * 3 ] = x;
		    positions[ i * 3 + 1 ] = y;
		    positions[ i * 3 + 2 ] = z;

		    // color.clone();
		    color.set ( colorUtils.makeColorGradient( i, frequency, undefined, undefined, phase ) );

			colors[ i * 3 ] = color.r;
			colors[ i * 3 + 1 ] = color.g;
			colors[ i * 3 + 2 ] = color.b;

		}
		// geometry.attributes.color.needsUpdate = true; // not needed

		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

		// drawcalls
		// drawCount = segments; // draw the first all points
        // geometry.addGroup( 0, drawCount, 0 );
        
        // var geometry = new LineGeometry();
        // geometry.setPositions( positions );
        // geometry.setColors( colors );
        // this.matLine = new LineMaterial( {
        //     color: 0xffffff,
        //     linewidth: 5, // in pixels
        //     vertexColors: THREE.VertexColors,
        //     //resolution:  // to be set by renderer, eventually
        //     dashed: false
        // } );
        // this.line = new Line2( geometry, this.matLine );
        // this.line.computeLineDistances();


		// line
		var line = new THREE.Line( geometry, material );

		return line;

	}
}