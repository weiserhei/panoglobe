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
// import Geometry from './helpers/geometry';
// import Stats from './helpers/stats';
import DomEvents from './helpers/domevents';

// Model
import Texture from './model/texture';
// import Model from './model/model';

import { getHeightData, getRandomArbitrary } from "../utils/panoutils";
import Preloader from "./components/preloader";
import Skybox from "./components/skybox";
import Route from './components/route';
import Sidebar from "./components/sidebar";
// import Particles from "./components/particles";

// Managers
import RouteManager from "./managers/routeManager";
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

// data
import Config from './../data/config';
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
    this.scene.add( this.controls.threeControls.object );
    this.light = new Light(this.scene, this.controls.threeControls.object );

    // Create and place lights in scene
    const lights = ['spot', 'directional', 'hemi', "point"];
    lights.forEach((light) => this.light.place(light));

    // Set up rStats if dev environment
    if(Config.isDev && Config.isShowingStats) {
      this.stats = new Stats(this.renderer);
      this.stats.setUp();
    }

    this.preloader = new Preloader(document.getElementById('loadcontainer'));

    // const listener = new THREE.AudioListener();
		// let audio = new THREE.Audio( listener );
    // let audioLoader = new THREE.AudioLoader(this.preloader.manager);
    // // audioLoader.load( 'assets/sounds/lightswitch.ogg', function ( buffer ) {
    //   audioLoader.load( 'assets/sounds/drawKnife1.ogg', function ( buffer ) {
    //     audio.setBuffer( buffer );
    //     audio.setLoop( false );
    //     audio.setVolume(0.3);
    //     // audio.play();
    //   } );
    // let audio2 = new THREE.Audio( listener );
    // // audioLoader.load( 'assets/sounds/handleSmallLeather2.ogg', function ( buffer ) {
    // audioLoader.load( 'assets/sounds/bookFlip3.ogg', function ( buffer ) {
    //   audio2.setBuffer( buffer );
    //   audio2.setLoop( false );
    //   audio2.setVolume(0.1);
    //   // audio.play();
    //   } );

      // let audios = {};
      // audios.open = audio;
      // audios.close = audio2;

    // Instantiate texture class
    this.texture = new Texture(this.preloader.manager);
    this.globus = new Globus( this.scene, this.light.directionalLight );
    this.skybox = new Skybox ( this.scene );

    const div = document.getElementById('wrapper');
    this.sidebar = new Sidebar(this.light, this.globus, this.controls.threeControls);
    
    var imageLoader = new THREE.ImageLoader (this.preloader.manager);
    const heightImageUrl = "./assets/textures/heightmap_1440.jpg";
    // var heightImage = imageLoader.load( heightImageUrl, image => { 
      //   var scale = 20;
      //   this.heightData = Panoutils.getHeightData( heightImage, scale );
      // });
    this._domEvents = new DomEvents( this.camera.threeCamera, this.container );
    this.heightData = [];
    this.routeManager = new RouteManager(this.scene, this.container, this._domEvents, this.heightData, Config.globus.radius, this.controls.threeControls, this.sidebar);

    const loadHeightData = url => new Promise(resolve => imageLoader.load(url, resolve));
    loadHeightData(heightImageUrl).then((heightImage) => {

      var scale = 20;
      this.heightData = getHeightData( heightImage, scale );
      this.routeManager.heightData = this.heightData;

      // asien
      const url = "https://relaunch.panoreisen.de/index.php?article_id=7&rex_geo_func=datalist";
      // amerika
      const url2 = "https://relaunch.panoreisen.de/index.php?article_id=165&rex_geo_func=datalist";

      // RouteManager.load(url, routeData => {
      //   const phase = getRandomArbitrary( 0, Math.PI * 2 );
      //   const route = this.routeManager.buildRoute( routeData, phase );
      //   // route.showLabels = false;
      // });

      RouteManager.load(url2, routeData => {
        // const phase = getRandomArbitrary( 0, Math.PI * 2 );
        const phase = 0.9;
        const route = this.routeManager.buildRoute( routeData, phase );
        // route.showLabels = false;

        // add in callback so first route is on top in sidebar
        this.sidebar.addLink("Asien 2010-2013", () => {
          RouteManager.load(url, routeData => {
            // const phase = getRandomArbitrary( 0, Math.PI * 2 );
            const phase = 5;
            const route2 = this.routeManager.buildRoute( routeData, phase );
            // route.showLabels = false;
          });
        });

      });

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
      // if(Config.isDev) {
      //   new DatGUI(this, this.globus.mesh);
      // }
      if(__ENV__ === 'dev') {
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

    // var raycaster = new THREE.Raycaster();
    // var mouse = new THREE.Vector2();

    // function onMouseMove( event ) {
    //   mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    //   mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // }
    // window.addEventListener( 'mousemove', onMouseMove, false );

    // document.addEventListener("click", () => {
    //   raycaster.setFromCamera( mouse, this.camera.threeCamera );

    //   // calculate objects intersecting the picking ray
    //   var intersects = raycaster.intersectObjects( [this.globus.mesh] );
    //   // for ( var i = 0; i < intersects.length; i++ ) {
    //   //   intersects[ i ].object.material.color.set( 0xff0000 );
    //   // }
  
    //   if ( intersects.length > 0 ) {
    //     var target = intersects[ 0 ];
    //     console.log( target);
    //     // on Hit something trigger hit effect emitter
    //     this.particles.setNormal( target.face.normal );
    //     this.particles.particleGroup.mesh.position.copy( target.point );
    //     this.particles.triggerPoolEmitter( 1 );
    //     // sadly broken
    //     // const impactPosition = new THREE.Vector3();
    //     // this.particles.particleGroup.triggerPoolEmitter( 1, ( impactPosition.set( target.point.x, target.point.y, target.point.z ) ) );
  
    //   }

    // });


  }

  update( delta ) {
    // Call any vendor or module frame updates here
    TWEEN.update();
    this.skybox.update( delta );
    this.controls.threeControls.update();
    this.routeManager.update(delta, this.camera.threeCamera, this.clock);

  }

  render() {

    // Delta time is sometimes needed for certain updates
    const delta = this.clock.getDelta();
    // Render rStats if Dev
    if(Config.isDev && Config.isShowingStats) {
      // Stats.start();
    }

    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

    // rStats has finished determining render call now
    if(Config.isDev && Config.isShowingStats) {
      // Stats.end();
    }

    this.update( delta );

    // RAF
    // requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
    requestAnimationFrame(() => this.render()); // Bind the main class instead of window object

  }

}
