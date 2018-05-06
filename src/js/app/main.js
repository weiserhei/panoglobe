// Global imports -
import * as THREE from 'three';
import TWEEN from 'tween.js';

// Local imports -
// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';
import Globus from './components/globus';

// Helpers
import Geometry from './helpers/geometry';
import Stats from './helpers/stats';

// Model
import Texture from './model/texture';
import Model from './model/model';

import * as Panoutils from "../utils/panoutils";
import Preloader from "./components/preloader";
import Skybox from "./components/skybox";
import RouteLoader from "./components/routeLoader";
import MarkerFactory from "./components/markerFactory";

// Managers
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

// data
import Config from './../data/config';
import Route from './components/route';
// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
  constructor(container) {
    // Set container property to container element
    this.container = container;

    // Start Three clock
    this.clock = new THREE.Clock();

    // Main scene creation
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    // Get Device Pixel Ratio first for retina
    if(window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    // Main renderer constructor
    this.renderer = new Renderer(this.scene, container);

    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer);
    this.controls = new Controls(this.camera.threeCamera, container);
    this.light = new Light(this.scene, this.controls.threeControls.object );

    // Create and place lights in scene
    const lights = ['spot', 'directional', 'hemi', "point"];
    lights.forEach((light) => this.light.place(light));

    // Set up rStats if dev environment
    if(Config.isDev && Config.isShowingStats) {
      this.stats = new Stats(this.renderer);
      this.stats.setUp();
    }

    this.preloader = new Preloader();

    // Instantiate texture class
    this.texture = new Texture(this.preloader.manager);
    this.globus = new Globus( this.scene, this.light.directionalLight );
    this.skybox = new Skybox ( this.scene );

    this.routeLoader = new RouteLoader();

    var imageLoader = new THREE.ImageLoader ();
    const heightImageUrl = "./assets/textures/heightmap_1440.jpg";
    // var heightImage = imageLoader.load( heightImageUrl, image => { 
    //   var scale = 20;
    //   this.heightData = Panoutils.getHeightData( heightImage, scale );
    // });
    const loadHeightData = url => new Promise(resolve => imageLoader.load(url, resolve));

    const markerFactory = new MarkerFactory(undefined, this.container);

    loadHeightData(heightImageUrl).then((heightImage) => {
      var scale = 20;
      this.heightData = Panoutils.getHeightData( heightImage, scale );
      // const url = "http://relaunch.panoreisen.de/index.php?article_id=7&rex_geo_func=datalist";
      const url = "http://relaunch.panoreisen.de/index.php?article_id=165&rex_geo_func=datalist";
      // const route = new Route( url,  );
      this.routeLoader.load(url, routeData => {
        const phase = Panoutils.getRandomArbitrary( 0, 6.2 );
        this.route = new Route( this.scene, markerFactory, routeData, this.heightData, Config.globus.radius, phase );
      }) 
    }).catch(() => {console.warn("Error loading height data image")});


    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {

      // Create and place geo in scene
      this.globus.setTextures(this.texture.textures);
      this.skybox.setTexture(this.texture.textures.stars);

      // this.manager = new THREE.LoadingManager();

      // Textures loaded, load model
      // this.model = new Model(this.scene, this.manager, this.texture.textures);
      // this.model.load();

      // // onProgress callback
      // this.manager.onProgress = (item, loaded, total) => {
      //   console.log(`${item}: ${loaded} ${total}`);
      // };

              // Set up interaction manager with the app now that the model is finished loading
              new Interaction(this.renderer.threeRenderer, this.scene, this.camera.threeCamera, this.controls.threeControls);

              // Add dat.GUI controls if dev
              if(Config.isDev) {
                new DatGUI(this, this.globus.mesh);
              }
      
              // Everything is now fully loaded
              Config.isLoaded = true;
              // this.container.querySelector('#loading').style.display = 'none';

      // All loaders done now
      // this.manager.onLoad = () => {
      // };
    });

    // Start render which does not wait for model fully loaded
    this.render();
  }

  render() {

    // Delta time is sometimes needed for certain updates
    const delta = this.clock.getDelta();
    // Render rStats if Dev
    if(Config.isDev && Config.isShowingStats) {
      Stats.start();
    }

    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

    // rStats has finished determining render call now
    if(Config.isDev && Config.isShowingStats) {
      Stats.end();
    }

    // Call any vendor or module frame updates here
    // TWEEN.update();
    this.controls.threeControls.update();
    this.skybox.update( delta );
    this.globus.update( delta );
    this.light.update( this.clock );

    if( this.route !== undefined ) {
      this.route.update( delta, this.camera.threeCamera );
    }

    // RAF
    // requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
    requestAnimationFrame(() => this.render()); // Bind the main class instead of window object

  }

}
