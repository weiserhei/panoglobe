import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Controls from "Classes/controls";
import Sidebar from "Classes/sidebar";
import Renderer from "Classes/renderer";
import Camera from "Classes/camera";
import Skybox from "Classes/skybox";
import Texture from 'Classes/texture';
import Globus from 'Classes/globus';
import LightManager from 'Classes/lightManager';
import DomEvents from './utils/domevents';
import RouteManager from 'Classes/routeManager';

import Config from './../data/config';

export default function(preloader, heightdata) {

    const container = document.createElement("div");
    const toggled = "toggled";
    // container.classList.add("page-wrapper", toggled, "ice-theme", "sidebar-bg", "bg1");
    container.classList.add("page-wrapper", toggled, "boder-radius-on", "legacy-theme");
    document.body.insertBefore(container, document.body.firstChild);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );
    scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    const globus = new Globus( scene, preloader );

    const renderer = new Renderer(scene, container);

    const camera = new Camera(renderer.threeRenderer);
    var controls = new Controls(camera.threeCamera, renderer.threeRenderer.domElement);
    controls.threeControls.update();

    const lightManager = new LightManager(scene, controls.threeControls.object );
    // Create and place lights in scene
    const lights = ['spot', 'directional', 'hemi'];
    lights.forEach((light) => lightManager.place(light));
    
    var geometry = new THREE.BoxGeometry( 10, 10, 10 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    const skybox = new Skybox(scene);

    const sidebar = new Sidebar(container, lightManager, globus, controls);

    //---------------
    const domEvents = new DomEvents( camera.threeCamera, container );
    const routeManager = new RouteManager(scene, container, domEvents, heightdata, Config.globus.radius, controls, sidebar);

    RouteManager.load(Config.routes.urls.pop(), routeData => {
        // const phase = getRandomArbitrary( 0, Math.PI * 2 );
        const phase = 0.9;
        const route = routeManager.buildRoute( routeData, phase );
        // route.showLabels = false;

        // add in callback so first route is on top in sidebar
        sidebar.addLink("Asien 2010-2013", () => {
          RouteManager.load(Config.routes.urls[0], routeData => {
            // const phase = getRandomArbitrary( 0, Math.PI * 2 );
            const phase = 5;
            const route2 = routeManager.buildRoute( routeData, phase );
            // route.showLabels = false;
          });
        });
      });

    // scene.add( controls.threeControls.object );
    // var cube = new THREE.Mesh( new THREE.BoxGeometry( 10, 10, 10 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
    // cube.position.set(0,0,120);
    // scene.add( cube );

    // cube.onBeforeRender = () => {
    //     const time = new Date().getTime();
    //     const r = Config.globus.radius + 3;
    //     const speed = 0.001;
    //     const x = Math.cos(time*speed) * r;
    //     const z = Math.sin(time*speed) * r;
    //     const y = Math.sin(time*speed / 2) * r - 5;

    //     cube.position.set(x, y, z);
    //     cube.lookAt(scene.position);
    // }

    const texture = new Texture(preloader.manager);
    texture.load().then(() => {
        globus.setTextures(texture.textures);
        // skybox.setTexture(texture.textures.uvtest);
        skybox.setTexture(texture.textures.stars);

        animate();
    });

    const clock = new THREE.Clock();
    let delta = 0;

    function update( delta ) {
        // update TWEEN before controls!! jaggy rotation
        TWEEN.update();
        skybox.update( delta );
        controls.threeControls.update();
        routeManager.update(delta, camera.threeCamera);
    }

    var animate = function () {
        requestAnimationFrame( animate );

        delta = clock.getDelta();
        update(delta);
    
        renderer.render( scene, camera.threeCamera );
    };
    
}