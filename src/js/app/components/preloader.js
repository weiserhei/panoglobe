import * as THREE from 'three';
import $ from "jquery";

export default class Preloader {
  constructor(container) {

    this.container = container;
    // this.container = document.getElementById("loadcontainer");

    this.manager = new THREE.LoadingManager ();
    this.textureLoader = new THREE.TextureLoader( this.manager );

    this.progressbar = document.getElementsByClassName( "progress-bar2" )[ 0 ];
    this.progressbar.style.width = "0px";
    
    const loader = document.getElementsByClassName("progress2")[0];
    this.barwidth = parseInt( window.getComputedStyle( loader ).getPropertyValue('width') );

    this.manager.onStart = () => {
      // make visible if hidden with fadeOut()
      this.container.style.display = "";
    };

    this.manager.onProgress = ( item, loaded, total ) => {
      this.onProgress( loaded, total );
    };
    this.manager.onError = function ( url ) {
      console.warn( "Loading Error", url );
    }
    this.manager.onLoad = () => {
      this.onLoad();
    }

  }

  onProgress( loaded, total ) {
    const progress = ( loaded / total ) * 100;

    // colors from
    // https://www.bypeople.com/animated-progress-bar/
    if( progress > 0 ) {
        var color = "#f63a0f";
    }
    if ( progress > 5 ) {
        var color = "#f27011";
    } 
    if ( progress > 25 ) {
        var color = "#f2b01e";
    } 
    if ( progress > 50 ) {
        var color = "#f2d31b";
    } 
    if( progress > 75 ) {
        var color = "#86e01e";
    }

    this.progressbar.style.backgroundColor = color;
    this.progressbar.style.width = 1 / ( total / loaded ) * this.barwidth +"px";
  }

  onLoad() {
    // set bar to 100% to prevent overflow
    // progressbar.style.width = 1 * barwidth + "px";
    // this.container.style.display = "none";
    // this.container.onclick = () => { $(this.container).fadeOut() };
    $(this.container).delay(400).fadeOut(800);
  }

}
