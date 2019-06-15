import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Controls from 'Classes/controls';
// import Sidebar from 'Classes/sidebar';
import Sidebar from 'Classes/sidebar2';
import Renderer from 'Classes/renderer';
import Camera from 'Classes/camera';
import Skybox from 'Classes/skybox';
import Texture from 'Classes/texture';
import Globus from 'Classes/globus';
import LightManager from 'Classes/lightManager';
import DomEvents from './utils/domevents';
import RouteManager from 'Classes/routeManager';
import Impact from 'Classes/impact';
import Mover from 'Classes/mover';
import * as sfc from 'Classes/splineFollowCamera';

import Config from './../data/config';
import { CatmullRomCurve3 } from 'three';

export default function (preloader, heightdata) {
  const container = document.createElement('div');
  container.id = 'wrapper';
  // container.className = "o-hidden";
  document.body.insertBefore(container, document.body.firstChild);

  // const sidebar = new Sidebar(container, lightManager, globus, controls);
  const sidebar = new Sidebar(container);
  // sidebar.container.appendChild(renderer.threeRenderer.domElement);
  // renderer.setContainer(sidebar.container);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

  const globus = new Globus(scene, preloader);
  const renderer = new Renderer(scene, container, sidebar.container2);

  const camera = new Camera(renderer.threeRenderer);
  // const controls = { threeControls: {}};
  const controls = new Controls(camera.threeCamera, renderer.threeRenderer.domElement);
  controls.threeControls.update();

  const lightManager = new LightManager(scene, controls.threeControls.object);
  // Create and place lights in scene
  const lights = ['spot', 'directional', 'hemi'];
  lights.forEach((light) => lightManager.place(light));

  const skybox = new Skybox(scene);

  //---------------
  const domEvents = new DomEvents(camera.threeCamera, sidebar.container2);
  const routeManager = new RouteManager(
    scene,
    sidebar.container,
    domEvents,
    heightdata,
    Config.globus.radius,
    controls,
    sidebar
  );

  const mover = new Mover(scene);

  RouteManager.load(Config.routes.urls.pop(), routeData => {
    // const phase = getRandomArbitrary( 0, Math.PI * 2 );
    const phase = 0.9;
    const route = routeManager.buildRoute(routeData, phase);
    // route.showLabels = false;
    const impacts = new Impact(globus, route);
    
    mover.setPath(route.routeLine.curve);
    mover.setRoute(route);

    // let pois = route.pois.map(poi => poi.displacedPos);
    // sfc.addTube( route._routeLine._curve );
    // const curve = new CatmullRomCurve3(pois, false, "catmullrom", 0.5);
    // let vertices = curve.getPoints( pois.length * 1 );
    // vertices = vertices.filter( el => !isNaN(el.x) );

    // const geometry = new THREE.Geometry();
    // geometry.vertices = vertices;
    // const lineMaterial = new THREE.LineBasicMaterial( {
    // color: 0xffffff,
    // linewidth: 1, // in pixels
    // // resolution: new Vector2(window.innerWidth, window.innerHeight),
    // //resolution:  // to be set by renderer, eventually
    // dashed: false
    // } );

    // let line = new THREE.Line( geometry, lineMaterial );
    // scene.add( line );
    // // sfc.addTube( curve );

    // add in callback so first route is on top in sidebar
    sidebar.addLink('Asien 2010-2013', () => {
      RouteManager.load(Config.routes.urls[0], routeData => {
        // const phase = getRandomArbitrary( 0, Math.PI * 2 );
        const phase = 5;
        const route2 = routeManager.buildRoute(routeData, phase);
        // route.showLabels = false;
      });
    });
  });

  const clock = new THREE.Clock();
  let delta = 0;

  function update(delta) {
    // update TWEEN before controls!! jaggy rotation
    mover.update(delta);
    TWEEN.update();
    skybox.update(delta);
    controls.threeControls.update();
    routeManager.update(delta, camera.threeCamera);
  }


  const animate = function animate() {
    requestAnimationFrame(animate);

    delta = clock.getDelta();
    update(delta);

    renderer.render(scene, camera.threeCamera);
    // sfc.render( renderer, scene );
  };

  const texture = new Texture(preloader.manager);
  texture.load().then(() => {
    globus.setTextures(texture.textures);
    // skybox.setTexture(texture.textures.uvtest);
    skybox.setTexture(texture.textures.stars);

    animate();
  });
}
