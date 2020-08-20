import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import TWEEN from "@tweenjs/tween.js";

import Controls from "./classes/controls";
import Renderer from "./classes/renderer";
import Camera from "./classes/camera";
import Skybox from "./classes/skybox";
import Texture from "./classes/texture";
import Globus from "./classes/globus";
import LightManager from "./classes/lightManager";
import RouteManager from "./classes/routeManager";
// import Impact from "./classes/impact";
import * as dat from "dat.gui";

import Config from "../data/config";

export default function (preloader: any, heightdata: Array<number>) {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    const globus = new Globus(scene, preloader);
    const renderer = new Renderer(container);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    container.appendChild(labelRenderer.domElement);
    /*global process*/
    /*eslint no-undef: "error"*/
    if (process.env.NODE_ENV === "development") {
        const gui = new dat.GUI({ autoPlace: false });
        var folder = gui.addFolder("GUI");
        // folder.open();
        container.insertBefore(gui.domElement, labelRenderer.domElement);
        // labelRenderer.domElement.appendChild(gui.domElement);
        gui.domElement.classList.add(
            "ml-auto",
            "position-absolute",
            "fixed-top"
        );
    }

    document.addEventListener("DOMContentLoaded", resize, false);
    window.addEventListener("resize", resize);
    function resize() {
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    const camera = new Camera(renderer.threeRenderer);
    const controls = new Controls(camera.threeCamera, labelRenderer.domElement);
    controls.threeControls.update();
    if (process.env.NODE_ENV === "development") {
        folder.add(controls.threeControls, "enableDamping");
    }

    const lightManager = new LightManager(scene, controls.threeControls.object);
    // Create and place lights in scene
    const lights = ["spot", "directional", "hemi"];
    lights.forEach((light) => lightManager.place(light));

    const skybox = new Skybox(scene);

    //---------------
    const routeManager = new RouteManager(
        scene,
        container,
        heightdata,
        Config.globus.radius,
        controls
    );

    RouteManager.load(Config.routes.urls.pop(), (routeData: Array<Object>) => {
        // RouteManager.load(Config.routes.urls[0], routeData => {
        // const phase = getRandomArbitrary( 0, Math.PI * 2 );
        const phase = 0.9;
        const route = routeManager.buildRoute(routeData, phase, folder);

        // route.showLabels = false;
        // const impacts = new Impact(globus, route);

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

    if (process.env.NODE_ENV === "development") {
        var obj = {
            add: function () {
                RouteManager.load(
                    Config.routes.urls[0],
                    (routeData: Array<Object>) => {
                        // const phase = getRandomArbitrary( 0, Math.PI * 2 );
                        const phase = 5;
                        const route2 = routeManager.buildRoute(
                            routeData,
                            phase,
                            folder
                        );
                        // route.showLabels = false;
                    }
                );
            },
        };
        folder.add(obj, "add").name("Add Route Asien");
    }

    const clock = new THREE.Clock();
    let delta = 0;

    function update(delta: number) {
        // update TWEEN before controls! jaggy rotation
        // @ts-ignore
        TWEEN.update();
        skybox.update(delta);
        controls.threeControls.update();
        routeManager.update(delta, camera.threeCamera);
    }

    const animate = function animate() {
        requestAnimationFrame(animate);

        delta = clock.getDelta();
        update(delta);
        labelRenderer.render(scene, camera.threeCamera);
        renderer.render(scene, camera.threeCamera);
    };

    const texture = new Texture(preloader.manager);
    texture.load().then(() => {
        globus.setTextures(texture.textures);
        // skybox.setTexture(texture.textures.uvtest);
        skybox.setTexture(texture.textures["stars"]);

        animate();
    });
}
