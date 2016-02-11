/**
 * get Height Data
 * from Image
 */
define([], function () {

	function getHeightData(img, scale) {

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

	function array2D(x, y)
	{
		var array2D = new Array(x);

		for(var i = 0; i < array2D.length; i++)
		{
			array2D[i] = new Array(y);
		}

		return array2D;
	}

	return getHeightData;
});