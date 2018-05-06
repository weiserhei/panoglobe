export default class LoadingScreen {
    constructor() {

        var progressbutton = document.getElementById( "progress-button" );
        this.progressbar = document.getElementsByClassName( "progressbar" )[ 0 ];
        this.container = document.getElementById("loadcontainer");
        this.message = document.getElementById("message");
        
        this.barwidth = parseInt( window.getComputedStyle( progressbutton ).getPropertyValue('width') );
        
        this.progressbar.style.width = "0px";
        
    }
    setProgress( loaded, total ) {
        this.progressbar.style.width = 1 / ( total / loaded ) * this.barwidth +"px";
    };

    complete() {
        // set bar to 100% to prevent overflow
        // progressbar.style.width = 1 * barwidth + "px";
        this.container.style.display = "none";
        this.message.style.display = "none";
    };

}