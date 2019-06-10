/**
 * Draw a the route line on the globe
 * uses one Buffer Geometry Line or
 * uses merged THREE.Line geometry
 */

import { 
    Vector2, 
    VertexColors, 
    Geometry, 
    BufferGeometry, 
    BufferAttribute, 
    Color, 
    LineBasicMaterial, 
    Line,
    CatmullRomCurve3
} from "three";
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

import { makeColorGradient, makeColorGradient2 } from "./../utils/colors";
import { createSphereArc } from "./../utils/panoutils";


export default class RouteLine {
    constructor( lineSegments ) {

        // deürecated
		// this._segments = lineSegments; // how many line segments
	
		this._lineMergeGeometry = new Geometry();
		this._line;

		this.positions;
		this.colors;

		this._numberVertices = 0;

        this._drawCount = 0;
        
        this.colorWheel = 0;
        this.throttle = 0;

        this.vertices = [];

	}

	// get segments() {
	// 	return this._segments;
	// }

	get line() {
		return this._line;
	}

	get numberVertices() {
		return this._numberVertices;
    }
    
    set drawCount( value ) {
        this._drawCount = value;
        this.update();
    }

	get drawCount() {
		return this._drawCount;
	}

	update(speed = 1) {
		// http://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically/31411794#31411794
		if ( this._line.geometry instanceof LineGeometry ) {
            // Thick Line
            // console.log(this._drawCount);
            this._line.geometry.maxInstancedCount = this._drawCount -1;
        }
        else if( this._line.geometry instanceof BufferGeometry) {
            this._line.geometry.setDrawRange( 0, this._drawCount );
		} 

        // drawCount must be all vertices
        this._drawCount = ( this._drawCount + speed ) % ( this._numberVertices );	

    }

 
    rainbow( delta ) {

        const steps = 1;
        const phase = 0.9;
        
        const numberVertices = this._numberVertices = this._lineMergeGeometry.vertices.length;
		const color = new Color();
		const frequency = 1 / ( steps * numberVertices );
        
        this.colorWheel = (this.colorWheel + 3 ) % numberVertices;
        // console.log(this.colorWheel);
		// this.positions = new Float32Array( numberVertices * 3 ); // 3 vertices per point
        const colors = new Float32Array( numberVertices * 3 );
        const self = this;
		this._lineMergeGeometry.vertices.forEach((vertice, i) => {

            if( i == self.colorWheel || i == self.colorWheel+2 || i == self.colorWheel+4 
                || i == self.colorWheel+6 || i== self.colorWheel+8 || i == self.colorWheel+10 ) {
                const highlightcolor = new Color(0xFFFFFF);
                colors[ i * 3 ] = highlightcolor.r;
                colors[ i * 3 + 1 ] = highlightcolor.g;
                colors[ i * 3 + 2 ] = highlightcolor.b;
            } else {
                // this.positions[ i * 3 ] = vertice.x;
                // this.positions[ i * 3 + 1 ] = vertice.y;
                // this.positions[ i * 3 + 2 ] = vertice.z;
                color.set ( makeColorGradient( i, frequency, undefined, undefined, phase ) );
                // color.set(0x883300);
                colors[ i * 3 ] = color.r;
                colors[ i * 3 + 1 ] = color.g;
                colors[ i * 3 + 2 ] = color.b;
            }
        });

        return colors;
        
    }
    
    updateColors( delta ) {
        const geometry = this._line.geometry;            
    
        // Put your drawing code here
        const colors = this.rainbow( delta );
        // geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        geometry.setColors(colors);

    }

	drawFull() {

		if( this._line.geometry instanceof LineGeometry ) {
			// thick line
			this._line.geometry.maxInstancedCount = this._numberVertices - 1;
		} else if( this.line.geometry instanceof BufferGeometry ) {
			this.line.geometry.setDrawRange( 0, this._numberVertices );
		}

    }
    
    _buildCatmullRom( vertices, steps, phase ) {
        const curve = new CatmullRomCurve3(vertices);
        // const curve = new CatmullRomCurve3(x, false, "catmullrom", 10);
        const points = curve.getPoints( vertices.length * 100 );

        const numberVertices = this._numberVertices = points.length;
		const color = new Color();
		const frequency = 1 /  ( steps * numberVertices );

		this.positions = new Float32Array( numberVertices * 3 ); // 3 vertices per point
        this.colors = new Float32Array( numberVertices * 3 );                

		points.forEach((vertice, i) => {

		    this.positions[ i * 3 ] = vertice.x;
		    this.positions[ i * 3 + 1 ] = vertice.y;
		    this.positions[ i * 3 + 2 ] = vertice.z;

			color.set ( makeColorGradient( i, frequency, undefined, undefined, phase ) );

			this.colors[ i * 3 ] = color.r;
			this.colors[ i * 3 + 1 ] = color.g;
			this.colors[ i * 3 + 2 ] = color.b;

        });

    }

    getCatmullLine( vertices, steps, phase, linewidth ) {
        this._buildCatmullRom( vertices, steps, phase );

        const geometry = new LineGeometry();
        geometry.setPositions( this.positions );
		geometry.setColors( this.colors );
		
        const lineMaterial = new LineMaterial( {
            color: 0xffffff,
            linewidth: linewidth, // in pixels
            vertexColors: VertexColors,
            resolution: new Vector2(window.innerWidth, window.innerHeight),
            //resolution:  // to be set by renderer, eventually
            dashed: false
		} );
		
        this._line = new Line2( geometry, lineMaterial );

        // var geometry = new BufferGeometry().setFromPoints( points );
        // var material = new LineBasicMaterial( { color : 0xff0000 } );
        // var curveObject = new Line( geometry, material );

        return this._line;
    }

	_build( vertices, steps, phase ) {
		// calculate Positions and Colors
        // based on steps and color phase
        const numberVertices = this._numberVertices = vertices.length;
		const color = new Color();
		const frequency = 1 /  ( steps * numberVertices );

		this.positions = new Float32Array( numberVertices * 3 ); // 3 vertices per point
		this.colors = new Float32Array( numberVertices * 3 );

		vertices.forEach((vertice, i) => {

		    this.positions[ i * 3 ] = vertice.x;
		    this.positions[ i * 3 + 1 ] = vertice.y;
		    this.positions[ i * 3 + 2 ] = vertice.z;

			color.set ( makeColorGradient( i, frequency, undefined, undefined, phase ) );

			this.colors[ i * 3 ] = color.r;
			this.colors[ i * 3 + 1 ] = color.g;
			this.colors[ i * 3 + 2 ] = color.b;

        });

	}
    
    getThickLine( vertices, steps, phase, linewidth, CMR ) {
        if( CMR ) {
            // const curve = new CatmullRomCurve3(vertices);
            const curve = new CatmullRomCurve3(vertices, false, "catmullrom", 1);
            var points = curve.getPoints( (vertices.length-1) * 2 );
            // remove NaN points
            points = points.filter( el => !isNaN(el.x) );
        } else {
            var points = vertices;
        }

		this._build( points, steps, phase );
        const geometry = new LineGeometry();
        geometry.setPositions( this.positions );
		geometry.setColors( this.colors );
		
        const lineMaterial = new LineMaterial( {
            color: 0xffffff,
            linewidth: linewidth, // in pixels
            vertexColors: VertexColors,
            resolution: new Vector2(window.innerWidth, window.innerHeight),
            //resolution:  // to be set by renderer, eventually
            dashed: false
		} );
		
        this._line = new Line2( geometry, lineMaterial );
		// this._line.computeLineDistances();
		// this._line.scale.set( 1, 1, 1 );

        window.addEventListener('resize', () => { this._line.material.resolution.set( window.innerWidth, window.innerHeight ); }, false);
		// render "on top"
		// interferes with atmosphere material
		// this._line.renderOrder = 999;
		// this._line.onBeforeRender = function( renderer ) { 
		// 	renderer.clearDepth(); 
		// };

        return this._line;
    }

	
	getColoredBufferLine( steps, phase ) {

		this._build( steps, phase );

		// geometry
		const geometry = new BufferGeometry();
		geometry.addAttribute( 'position', new BufferAttribute( this.positions, 3 ) );
		geometry.addAttribute( 'color', new BufferAttribute( this.colors, 3 ) );

		// material
		const lineMaterial = new LineBasicMaterial({ vertexColors: VertexColors });

		// line
		this._line = new Line( geometry, lineMaterial );

		return this._line;

	}

    // old, wasteful, deprecate
	connectGeometry( from, to, segments ) {
		const curve = createSphereArc( from, to );
		const lineGeometry = new Geometry();
		lineGeometry.vertices = curve.getPoints( segments ); // how many vertices do we want on this guy? this is for *each* side
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