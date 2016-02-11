/**
 * Panoutils
 */
define(["three"], function (THREE) {

	'use strict';
	
	var utils = {};

	/**
	 * Returns a random number between min (inclusive) and max (exclusive)
	 */
	utils.getRandomArbitrary = function ( min, max ) {
	    return Math.random() * (max - min) + min;
	};

	/**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	utils.getRandomInt = function ( min, max ) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	/* COLORS */			 
	utils.makeColorGradient = function ( i,
							 redFrequency , grnFrequency, bluFrequency,
							 phase1, phase2, phase3 )
	{  
		var center = 128;
		var width = 127;
		
		if ( redFrequency === undefined ) redFrequency = 0.3;
		if ( grnFrequency === undefined ) grnFrequency = redFrequency; 
		if ( bluFrequency === undefined ) bluFrequency = redFrequency;
		
		if ( phase1 === undefined ) phase1 = 0;
		if ( phase2 === undefined ) phase2 = phase1+2;
		if ( phase3 === undefined ) phase3 = phase1+4;
		  
		var red   = Math.sin( redFrequency * i + phase1 ) * width + center;
		var green = Math.sin( grnFrequency * i + phase2 ) * width + center;
		var blue  = Math.sin( bluFrequency * i + phase3 ) * width + center;
		
		return parseInt( '0x' + _byte2Hex( red ) + _byte2Hex( green ) + _byte2Hex( blue ) );
	};

	var _byte2Hex = function(n)
	{
		var nybHexString = "0123456789ABCDEF";
		return String( nybHexString.substr( ( n >> 4 ) & 0x0F, 1 ) ) + nybHexString.substr( n & 0x0F, 1 );
	};
	/* COLORS END */	

	utils.randomColorRoute = function (){	
		var Rrand;
		var Grand;
		var Brand;

		do {
			Rrand = Math.random();
			Grand = Math.random();
			Brand = Math.random();
		}	while((Rrand+Brand+Grand)<1.5); //ONLY ALLOW BRIGHT RANDOM COLORS
		//while((Rrand,Grand,Brand)<0.5); //ONLY PASTELL RANDOMS

		//GENERATE RANDOM COLORED BLOBS, LIGHTS, LINES - ALL THE SAME RANDOM COLOR
		for (var i = meshGroup.children.length - 1; i >= 0 ; i -- ) {
				meshGroup.children[ i ].material.color.setRGB(Rrand, Grand, Brand);
				meshGroup.children[ i ].material.emissive.setRGB(Rrand, Grand, Brand);
				lightGroup.children [ i ].color.setRGB(Rrand, Grand, Brand);
				if(lineGroup.children[ i ]) { lineGroup.children[ i ].material.color.setRGB(Rrand, Grand, Brand); }
		}
	};

	var _convertLatLonToVec3 = function(lat,lon) {
		lat =  lat * Math.PI / 180.0;
		lon = -lon * Math.PI / 180.0;
		return new THREE.Vector3( 
			Math.cos(lat) * Math.cos(lon), //rechts links invert
			Math.sin(lat),  // up down invert
			Math.cos(lat) * Math.sin(lon));
	};


	utils.calc3DPositions = function ( data, heightData, radius ) {
	//calculate Position + displaced Position in 3D Space

		data.distance = 0;
		
		for( var i = 0; i < data.length; i ++ ) {
		

			if ( data[ i - 1 ] !== undefined ) {

				// distanz zum vorgänger berechnen
				data.distance += utils.calcCrow( data[ i ], data[ i - 1 ] );
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
			data[ i ].pos = _convertLatLonToVec3(data[ i ].lat, data[ i ].lng).multiplyScalar( radius ); //100.5

			if ( heightData.length > 0 ) {
			
				var latHeight = Math.floor( ( ( data[i].lat * ( heightData.length / 180 ) ) - ( heightData.length / 2 ) ) * -1 );
				var lngHeight = Math.floor( ( data[i].lng ) * ( heightData[0].length / 360 ) ) + ( heightData[0].length / 2 );
				
				if ( latHeight > heightData.length-1 ) { latHeight = heightData.length; }				

				//LOOKUP TOPOLOGIC HEIGHT IN HEIGHTDATA ARRAY
				var height = heightData[ latHeight ][ lngHeight ];

				data[ i ].displaceHeight = height;
				data[ i ].displacedPos = _convertLatLonToVec3(data[ i ].lat, data[ i ].lng).multiplyScalar( radius + 0.5 + height );

			} else {
				data[ i ].displacedPos = data[ i ].pos;
			}

			
			// console.log( "height von ", data[i].name, ": ", height, "scaled height: ", data[i].displaceHeight );

		}

		return data;

	};

	utils.calcCrow = function ( a, b ) 
	{
		// console.log("a", a, "b", b);

		var lat1 = 	a.lat;
		var lon1 = a.lng;
		var lat2 = b.lat;
		var lon2 = b.lng;
		
		var R = 6371; // km
		var dLat = utils.toRad(lat2-lat1);
		var dLon = utils.toRad(lon2-lon1);
		var lat1 = utils.toRad(lat1);
		var lat2 = utils.toRad(lat2);

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c;

		// console.log("distance", d, "zwischen", a.adresse, b.adresse);
		// console.log("distance", d, "zwischen", lat1, lon1, b.adresse);

		return d;
	  
	};

	// Converts numeric degrees to radians
	utils.toRad = function ( Value ) 
	{
		return Value * Math.PI / 180;
	};

	utils.numberWithCommas = function ( x ) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};

		// Math functions from stemkoski

	utils.greatCircleFunction = function(P, Q, angleMultiplier){

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

	utils.createSphereArc = function( P, Q ){
		var sphereArc = new THREE.Curve();
		sphereArc.getPoint = utils.greatCircleFunction( P, Q );
		return sphereArc;
	};

	return utils;
});