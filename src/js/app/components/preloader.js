import * as THREE from 'three';

import LoadingScreen from './loadingScreen';

// Main webGL renderer class
export default class preloader {
  constructor(container) {

    var loadingScreen = new LoadingScreen(container);

    this.manager = new THREE.LoadingManager ();
    this.textureLoader = new THREE.TextureLoader( this.manager );

    this.manager.onProgress = function ( item, loaded, total ) {
      loadingScreen.setProgress( loaded, total );
    };
    this.manager.onError = function ( url ) {
      console.warn( "Loading Error", url );
    }
    this.manager.onLoad = function() {
      loadingScreen.complete();
    }


  }

}
