/* COLORS */	

const byte2Hex = (n) => {
    var nybHexString = "0123456789ABCDEF";
    return String( nybHexString.substr( ( n >> 4 ) & 0x0F, 1 ) ) + nybHexString.substr( n & 0x0F, 1 );
}

const randomColorRoute = () => {	
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
}

const makeColorGradient = (i, redFrequency , grnFrequency, bluFrequency, phase1, phase2, phase3 ) => {

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
    
    return parseInt( '0x' + byte2Hex( red ) + byte2Hex( green ) + byte2Hex( blue ) );

}

module.exports = {
    makeColorGradient,
    randomColorRoute
};