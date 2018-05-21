import { LoadingManager, TextureLoader } from 'three';
import $ from "jquery";

function getProgressColor( progress ) {
  let color = "";
  const colors = [[5, "#f63a0f"], [25, "#f27011"], [50, "#f2b01e"], [75, "#f2d31b"], [100, "#86e01e"]];
  colors.forEach((step) => { 
    if(progress >= step[0]) { 
      color = step[1]; 
    }
  });
  return color;
}

export default class Preloader {
  constructor(container) {

    // this.container = document.getElementById("loadcontainer");

    this.manager = new LoadingManager ();
    this.textureLoader = new TextureLoader( this.manager );

    this.zIndex = container.style.zIndex;

    const progressbar = document.getElementsByClassName( "progress-bar2" )[ 0 ];
    progressbar.style.width = "0px";
    
    const progressbarContainer = document.getElementsByClassName("progress2")[0];
    // const style = window.getComputedStyle( this.progressbar.parentElement );
    const style = window.getComputedStyle( progressbarContainer );
    const padding = parseInt( style.paddingLeft ) + parseInt( style.paddingRight );

    const barwidth = parseInt( window.getComputedStyle( progressbarContainer ).getPropertyValue('width') ) - padding;

    this.manager.onStart = () => {
      // make visible if hidden with fadeOut()
      container.style.display = "none";
      if( this._inline ) {
        this._modifyCSS( container, progressbarContainer );
      }
    };

    this.manager.onProgress = ( item, loaded, total ) => {
      const progress = ( loaded / total ) * 100;

      progressbar.style.backgroundColor = getProgressColor( progress );
      progressbar.style.width = 1 / ( total / loaded ) * barwidth + "px";
    };

    this.manager.onLoad = () => {
      // set bar to 100% to prevent overflow
      // this.progressbar.style.width = 1 * this.barwidth + "px";
      // this.container.style.display = "none";
      // container.onclick = () => { $(container).fadeOut() };
      $(container).delay(400).fadeOut(800);
    };

    this.manager.onError = ( url ) => {
      console.warn( "Loading Error", url );
    };

  }

  _modifyCSS( container, progressbarContainer ) {
    container.style.zIndex = this.zIndex;
    container.style.background = "radial-gradient(ellipse at center, rgba(10, 10, 10, 1) 30%,rgba(0, 0, 0, 0.5) 100%)";
    // hide progress bar
    progressbarContainer.style.display = "none";
  }

  set inline( value ) {
    this._inline = value;
    if( value ) {
      this.zIndex = 998;
    }
  }

}
