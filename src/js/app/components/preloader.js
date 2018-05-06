import * as THREE from 'three';

import Config from '../../data/config';

import LoadingScreen from './loadingScreen';

// Main webGL renderer class
export default class preloader {
  constructor() {

    var loadingScreen = new LoadingScreen();

    this.manager = new THREE.LoadingManager ();

    this.manager.onProgress = function ( item, loaded, total ) {
        loadingScreen.setProgress( loaded, total );
    };
    this.manager.onError = function ( url ) {
      console.warn( "Loading Error", url );
    }
    this.manager.onLoad = function() {
      loadingScreen.complete();
    }

    this.textureLoader = new THREE.TextureLoader( this.manager );

  }

}
