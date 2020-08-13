import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Controls from 'Classes/controls';
import Renderer from 'Classes/renderer';
import Camera from 'Classes/camera';
import Skybox from 'Classes/skybox';
import Texture from 'Classes/texture';
import Globus from 'Classes/globus';
import LightManager from 'Classes/lightManager';
import RouteManager from 'Classes/routeManager';
import Impact from 'Classes/impact';

import Config from './../data/config';

export default function (preloader, heightdata) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

  const globus = new Globus(scene, preloader);
  const renderer = new Renderer(container);

  const camera = new Camera(renderer.threeRenderer);
  const controls = new Controls(camera.threeCamera, renderer.threeRenderer.domElement);
  controls.threeControls.update();

  const lightManager = new LightManager(scene, controls.threeControls.object);
  // Create and place lights in scene
  const lights = ['spot', 'directional', 'hemi'];
  lights.forEach((light) => lightManager.place(light));

  const skybox = new Skybox(scene);

  //---------------
  const routeManager = new RouteManager(
    scene,
    container,
    heightdata,
    Config.globus.radius,
    controls,
  );

  RouteManager.load(Config.routes.urls.pop(), routeData => {
    // const phase = getRandomArbitrary( 0, Math.PI * 2 );
    const phase = 0.9;
    const route = routeManager.buildRoute(routeData, phase);
    // route.showLabels = false;
    const impacts = new Impact(globus, route);

    // add in callback so first route is on top in sidebar
    // sidebar.addLink('Asien 2010-2013', () => {
    //   RouteManager.load(Config.routes.urls[0], routeData => {
    //     // const phase = getRandomArbitrary( 0, Math.PI * 2 );
    //     const phase = 5;
    //     const route2 = routeManager.buildRoute(routeData, phase);
    //     // route.showLabels = false;
    //   });
    // });
  });

  const clock = new THREE.Clock();
  let delta = 0;

  function update(delta) {
    // update TWEEN before controls!! jaggy rotation
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
  };

  const texture = new Texture(preloader.manager);
  texture.load().then(() => {
    globus.setTextures(texture.textures);
    // skybox.setTexture(texture.textures.uvtest);
    skybox.setTexture(texture.textures.stars);

    animate();
  });
}
