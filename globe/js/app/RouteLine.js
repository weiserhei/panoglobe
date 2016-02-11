/**
 * Draw a the route line on the globe
 * uses one Buffer Geometry Line or
 * uses merged THREE.Line geometry
 */

define(["three","putils"], function (THREE, putils) {

	function RouteLine ()
	{

		this.lineMergeGeometry = new THREE.Geometry();
		this.lineMaterial = new THREE.LineBasicMaterial();
		this.from = null;
		this.segments = 10;
		this.vertices = 0;

	}

	RouteLine.prototype.connect = function( to ) {

		if( this.from === null ){
			//catch first call
			this.from = to;
			return;
		}
		
		var curve = putils.createSphereArc( this.from.displacedPos, to.displacedPos );
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices = curve.getPoints( this.segments - 1 ); //	how many vertices do we want on this guy? this is for *each* side
		lineGeometry.computeLineDistances();

		this.lineMergeGeometry.merge( lineGeometry );

		this.from = to;

	};

	RouteLine.prototype.getColoredLine = function( steps, phase ) {
		
		var vertexColors = [];
		var frequency = 1 /  ( steps * this.lineMergeGeometry.vertices.length );
		var color = new THREE.Color();
		
		for ( var i = 0; i < this.lineMergeGeometry.vertices.length; i ++ ) {

			vertexColors[ i ] = color.clone();
			color.set ( putils.makeColorGradient( i, frequency, undefined, undefined, phase ) );

			// vertexColors[ i ].setHSL( i / routeData.length, 1.0, 0.5 );

		}

		this.lineMergeGeometry.colors = vertexColors;

		var coloredLine = new THREE.Line( this.lineMergeGeometry, this.lineMaterial );
		coloredLine.material.vertexColors = THREE.VertexColors;

		return coloredLine;

	};

	RouteLine.prototype.getColoredBufferLine = function( steps, phase ) {

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
		    color.set ( putils.makeColorGradient( i, frequency, undefined, undefined, phase ) );

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

		// line
		line = new THREE.Line( geometry, material );

		return line;

	};

    return RouteLine;
});