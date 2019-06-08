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

import Config from './../data/config';

export default function(preloader) {

    const container = document.createElement("div");
    const toggled = "toggled";
    container.classList.add("page-wrapper", "ice-theme", "sidebar-bg", "bg1");
    document.body.insertBefore(container, document.body.firstChild);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );
    scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    const globus = new Globus( scene, preloader );

    const renderer = new Renderer(scene, container);
    const camera = new Camera(renderer.threeRenderer);
    var controls = new Controls(camera.threeCamera, container);
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
    // add in callback so first route is on top in sidebar
    sidebar.addLink("Asien 2010-2013", () => {
        alert("click");
    });
    
    // scene.add( controls.threeControls.object );
    var cube = new THREE.Mesh( new THREE.BoxGeometry( 10, 10, 10 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
    cube.position.set(0,0,120);
    scene.add( cube );
    // controls.threeControls.object.add( cube );

    cube.onBeforeRender = () => {
        const time = new Date().getTime();
        const r = Config.globus.radius + 3;
        const speed = 0.001;
        const x = Math.cos(time*speed) * r;
        const z = Math.sin(time*speed) * r;
        const y = Math.sin(time*speed / 2) * r - 5;

        cube.position.set(x, y, z);
        cube.lookAt(scene.position);
    }

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

        controls.threeControls.update();
        TWEEN.update();
        skybox.update( delta );

    }

    var animate = function () {
        requestAnimationFrame( animate );

        delta = clock.getDelta();
        update(delta);
    
        renderer.render( scene, camera.threeCamera );
    };
    
}