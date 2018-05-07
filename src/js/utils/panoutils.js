/**
 * Panoutils
 */
import * as THREE from "three";
import calcCrow from "./calcCrow";

const numberWithCommas = (x) => {	
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
const getRandomArbitrary = ( min, max ) => {
	return Math.random() * (max - min) + min;
};

// Math functions from stemkoski
function greatCircleFunction(P, Q, angleMultiplier){

    var angle = P.angleTo(Q);
    angle += angleMultiplier || 0;
    
    return function(t)
    {
        var X = new THREE.Vector3().addVectors(
            P.clone().multiplyScalar(Math.sin( (1 - t) * angle )), 
            Q.clone().multiplyScalar(Math.sin(      t  * angle )))
            .divideScalar( Math.sin(angle) );
        return X;
    };
    

};

function convertLatLonToVec3(lat,lon) {
    lat =  lat * Math.PI / 180.0;
    lon = -lon * Math.PI / 180.0;
    return new THREE.Vector3( 
        Math.cos(lat) * Math.cos(lon), //rechts links invert
        Math.sin(lat),  // up down invert
        Math.cos(lat) * Math.sin(lon));
};

/**
 * get Height Data
 * from Image
 */

function array2D(x, y)
{
	var array2D = new Array(x);

	for(var i = 0; i < array2D.length; i++)
	{
		array2D[i] = new Array(y);
	}

	return array2D;
}

const getHeightData = (img, scale) => {		

	if (scale == undefined) scale = 10;

	var canvas = document.createElement( 'canvas' );
	canvas.width = img.width;
	canvas.height = img.height;

	var context = canvas.getContext( '2d' );
	context.drawImage( img,0,0 );

	//var data = new Float32Array( size );
	var data = array2D( img.height, img.width );
	var imgd = context.getImageData( 0, 0, img.width, img.height );
	var pix = imgd.data;
	var j=0,
		a=0;

	for ( var i = 0, n = pix.length; i < n; i += (4) ) {
		var all = pix[i] + pix[i+1] + pix[i+2];
		if ( j === img.width) { j = 0; a++; }

		data[ a ][ j++ ] = all/(12*scale);
	}

	return data;

}

const createSphereArc = ( P, Q ) => {
    var sphereArc = new THREE.Curve();
    sphereArc.getPoint = greatCircleFunction( P, Q );
    return sphereArc;
};

const calc3DPositions = (data, heightData, radius) => {
    //calculate Position + displaced Position in 3D Space
	data.distance = 0;
	for( var i = 0; i < data.length; i ++ ) {
	
		if ( data[ i - 1 ] !== undefined ) {

			// distanz zum vorgänger berechnen
			data.distance += calcCrow( data[ i ], data[ i - 1 ] );
			data[ i ].hopDistance = data.distance;

		} 

		else {
			// erster wegpunkt
			data[ i ].hopDistance = 0;

		}

		// so funktionierts (außer letzter punkt)
		// CALCULATE HOP- AND OVERALL TRAVEL DISTANCE IN KILOMETERS
		// if ( data[ i + 1 ] !== undefined ) {
			
		// 	data[ i ].hopDistance = data.distance;
		// 	data.distance += utils.calcCrow( data[ i ], data[ i + 1 ] );

		// }

		//ADD 3D POSITION FIELDS TO EVERY BLOB, SO WE CAN DRAW CONNECTING CURVES IN THE NEXT LOOP
		data[ i ].pos = convertLatLonToVec3(data[ i ].lat, data[ i ].lng).multiplyScalar( radius ); //100.5

		if ( heightData.length > 0 ) {
		
			var latHeight = Math.floor( ( ( data[i].lat * ( heightData.length / 180 ) ) - ( heightData.length / 2 ) ) * -1 );
			var lngHeight = Math.floor( ( data[i].lng ) * ( heightData[0].length / 360 ) ) + ( heightData[0].length / 2 );
			
			if ( latHeight > heightData.length-1 ) { latHeight = heightData.length; }				

			//LOOKUP TOPOLOGIC HEIGHT IN HEIGHTDATA ARRAY
			var height = heightData[ latHeight ][ lngHeight ];

			data[ i ].displaceHeight = height;
			data[ i ].displacedPos = convertLatLonToVec3(data[ i ].lat, data[ i ].lng).multiplyScalar( radius + 0.5 + height );

		} else {
			data[ i ].displacedPos = data[ i ].pos;
		}

		
		// console.log( "height von ", data[i].name, ": ", height, "scaled height: ", data[i].displaceHeight );

	}

	return data;

}

module.exports = {
	numberWithCommas,
	getRandomArbitrary,
    getHeightData,
	calc3DPositions,
	createSphereArc
};