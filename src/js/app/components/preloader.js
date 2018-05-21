import * as THREE from 'three';
import $ from "jquery";

export default class Preloader {
  constructor(container) {

    this.container = container;
    // this.container = document.getElementById("loadcontainer");

    this.manager = new THREE.LoadingManager ();
    this.textureLoader = new THREE.TextureLoader( this.manager );

    this.zIndex = container.style.zIndex;

    this.progressbar = document.getElementsByClassName( "progress-bar2" )[ 0 ];
    this.progressbar.style.width = "0px";
    
    this.loader = document.getElementsByClassName("progress2")[0];
    this.barwidth = parseInt( window.getComputedStyle( this.loader ).getPropertyValue('width') );

    this.manager.onStart = () => {
      // make visible if hidden with fadeOut()
      this.container.style.display = "";
      if( this._inline ) {
        this._modifyCSS();
      }
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

  _modifyCSS() {
    this.container.style.zIndex = this.zIndex;
    this.container.style.background = "radial-gradient(ellipse at center, rgba(10, 10, 10, 1) 30%,rgba(0, 0, 0, 0.5) 100%)";
    // hide progress bar
    this.loader.style.display = "none";
  }

  set inline( value ) {
    this._inline = value;
    if( value ) {
      this.zIndex = 998;
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

    const style = window.getComputedStyle( this.progressbar.parentElement );
    const padding = parseInt( style.paddingLeft ) + parseInt( style.paddingRight );
    this.progressbar.style.backgroundColor = color;
    this.progressbar.style.width = 1 / ( total / loaded ) * this.barwidth - padding + "px";

  }

  onLoad() {
    // set bar to 100% to prevent overflow
    // this.progressbar.style.width = 1 * this.barwidth + "px";
    // this.container.style.display = "none";
    // this.container.onclick = () => { $(this.container).fadeOut() };
    $(this.container).delay(400).fadeOut(800);
  }

}
