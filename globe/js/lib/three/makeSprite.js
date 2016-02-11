function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters.fontface : "Trebuchet MS";
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters.fontsize : 18;
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters.borderThickness : 0;
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters.borderColor : { r:1, g:0, b:0, a:1.0 };
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters.backgroundColor : { r:0, g:0, b:0, a:0.5 };
	var fontWeight = parameters.hasOwnProperty("fontWeight") ?
		parameters.fontWeight : "Normal ";

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = fontWeight + " " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	canvas.width = textWidth+40;

	// Important to set font again after setting canvas width
	context.font = fontWeight + " " + fontsize + "px " + fontface;
	context.textBaseline = "top";
	
	// context.fillStyle = "rgba(255, 255, 255, 1.0)";
	// context.fillText(message, 10+10, 10+10/2);
	
	// border color
	// context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
	// context.lineWidth = borderThickness;
	
	//MULTILINE
	var lineHeight = context.measureText("M").width * 1.5;
	var lines = message.split("\n");
	
	// background color
	context.fillStyle	= "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
	// context.fillRect(10, 10, textWidth+10*2, parseInt(fontsize + "px " + fontface, 10) +10);
	// context.fillRect(10, 10, textWidth+10*2, lines.length * (parseInt(fontsize + "px " + fontface, 10) +10) );
	roundRect( context, 10, 8, textWidth+10*2, lines.length * (parseInt(fontsize + "px " + fontface, 10) +13), 10 );
	
	var y = 5;
	
	context.fillStyle = "rgba(255, 255, 255, 1.0)";
	for (var i = 0; i < lines.length; ++i) {
		if(lines.length>1 && i === 0) { y += 4; }
		context.fillText(lines[i], 20, y+10); //y + fontsize/2, fontsize
		y += lineHeight;
	}
	
	
	//function roundRect(ctx, x, y, w, h, r) 
	// roundRect( context, borderThickness/2, borderThickness/2, textWidth + borderThickness + fontsize, lines.length * fontsize * 1.4 + borderThickness, 6 );
	// roundRect( context, borderThickness/2, borderThickness/2, textWidth + borderThickness, lines.length * fontsize * 1.4 + borderThickness, 6 );
	// roundRect( context, 0, 0, textWidth/2, fontsize, 6 );
	// context.fillRect(30, 30, textWidth, parseInt(context.font, 10));
	//roundRect(context, borderThickness/2, borderThickness/2, fontsize+textWidth + borderThickness, lines.length * fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.

	
	// text color
	// context.fillStyle = "rgba(255, 255, 255, 1.0)";
	// context.textAlign = "center";

	// context.fillText( message, 30, 30);
	
	/*
	var y = borderThickness /2;
		
	for (var i = 0; i < lines.length; ++i) {
		if(lines.length>1 && i === 0) { y += 4; }
		// context.fillText(lines[i], fontsize/2, y+fontsize); //y + fontsize/2, fontsize
		// context.fillText(lines[i], 0, 0); //y + fontsize/2, fontsize
		y += lineHeight;
	}
	// */
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, depthWrite: false, depthTest: false } ); //useScreenCoordinates: false, removed in r72 :(
	var sprite = new THREE.Sprite( spriteMaterial );
	
	var width = spriteMaterial.map.image.width;
	var height = spriteMaterial.map.image.height;

	sprite.scale.set( width, height, 1 );
	sprite.material.map.minFilter = THREE.LinearFilter;
	// sprite.material.map.minFilter = THREE.NearestFilter;

	return sprite;	
}

function redraw(sprite) {

	message = " It works! ";
	var  borderThickness = 0.5;
	var fontsize = 34;
	
	var canvas = sprite.material.map.image; //document.getElementById('canvas');
	var context = canvas.getContext('2d');
	
	sprite.parent.remove(sprite);
	
    //context.fillStyle = "rgba(0, 0, 0, 1)"; // CLEAR WITH COLOR BLACK (new BG color)
    //context.fill(); // FILL THE CONTEXT
    context.fillStyle = "rgba(255, 255, 255, 1.0)"; // RED COLOR FOR TEXT
    //context.fillText(message, context.lineWidth, 24 + context.lineWidth); // WRITE TEXT
	context.fillText( message, borderThickness, fontsize + borderThickness);
	sprite.material.map.needsUpdate = true; 
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	// ctx.stroke();   
}

function fillTextMultiLine(ctx, text, x, y) {
  var lineHeight = ctx.measureText("M").width * 1.2;
  var lines = text.split("\n");
  for (var i = 0; i < lines.length; ++i) {
    ctx.fillText(lines[i], x, y);
    y += lineHeight;
  }
}