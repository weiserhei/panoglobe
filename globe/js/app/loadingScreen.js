/**
 * LoadingScreen
 */
define([], function () {

    'use strict';
    
    var progressbutton = document.getElementById( "progress-button" );
    var progressbar = document.getElementsByClassName( "progressbar" )[ 0 ];
    var loadcontainer = document.getElementById("loadcontainer");
    var message = document.getElementById("message");

    var barwidth = parseInt( window.getComputedStyle( progressbutton ).getPropertyValue('width') );

    progressbar.style.width = "0px";

    var setProgress = function( loaded, total ) {

    	progressbar.style.width = 1 / ( total / loaded ) * barwidth +"px";

    };

    var complete = function() {

        // set bar to 100% to prevent overflow
        // progressbar.style.width = 1 * barwidth + "px";
        loadcontainer.style.display = "none";
        message.style.display = "none";
    };

    return {
    	message: message,
    	container: loadcontainer,
    	setProgress: setProgress,
    	complete: complete
    };
});