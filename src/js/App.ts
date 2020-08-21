import "./../css/style.css";
import "./../scss/main.scss";

import { Scene, Color, FogExp2, Clock } from "three";
import { WEBGL } from "three/examples/jsm/WebGL.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import TWEEN from "@tweenjs/tween.js";
import * as dat from "dat.gui";

import Preloader from "./classes/preloader";
import Controls from "./classes/controls";
import Renderer from "./classes/renderer";
import Camera from "./classes/camera";
import Skybox from "./classes/skybox";
import Texture from "./classes/texture";
import Globus from "./classes/globus";
import LightManager from "./classes/lightManager";
import RouteManager from "./classes/routeManager";
import Route from "./classes/route";
// import Impact from "./classes/impact";

import Config from "../data/config";

if (!WEBGL.isWebGLAvailable()) {
    const warning = WEBGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
    throw new Error(warning.innerHTML);
}

class App {
    constructor(textures: object) {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const clock = new Clock();
        const renderer = new Renderer(container);
        const camera = new Camera(renderer.threeRenderer);

        const scene = new Scene();
        scene.background = new Color(0x000000);
        scene.fog = new FogExp2(Config.fog.color, Config.fog.near);

        const globus = new Globus(scene, preloader);
        const skybox = new Skybox(scene);

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
            folder.open();
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

        const controls = new Controls(
            camera.threeCamera,
            labelRenderer.domElement
        );

        const lightManager = new LightManager(
            scene,
            controls.threeControls.object
        );
        // Create and place lights in scene
        const lights = ["spot", "directional", "hemi"];
        lights.forEach((light) => lightManager.place(light));

        //---------------
        const routeManager = new RouteManager(
            scene,
            container,
            Config.globus.radius,
            controls
        );

        RouteManager.load(Config.routes.urls.pop()).then((x: RouteData) => {
            const route = routeManager.buildRoute(x, 0.9, folder);
            // route.then((route) => {
            //     // new Impact(globus, route);
            //     // route.showLabels = false;
            // });
        });

        if (process.env.NODE_ENV === "development") {
            var obj = {
                add: function () {
                    RouteManager.load(Config.routes.urls[0]).then(
                        (x: RouteData) => {
                            const route = routeManager.buildRoute(x, 5, folder);
                            route.then((route: Route) => {
                                // route.showLabels = false;
                            });
                        }
                    );
                },
                // RouteManager.load(
                //     Config.routes.urls[0],
                //     (routeData: Array<Object>) => {
                //         // const phase = getRandomArbitrary( 0, Math.PI * 2 );
                //         const phase = 5;
                //         const route2 = routeManager.buildRoute(
                //             routeData,
                //             phase,
                //             folder
                //         );
                //         // route.showLabels = false;
                //     }
                // );
            };
            folder.add(obj, "add").name("Add Route Asien");
        }

        globus.setTextures(textures);
        // skybox.setTexture(texture.textures.uvtest);
        skybox.setTexture(textures["stars"]);
        animate();

        function animate(): void {
            requestAnimationFrame(animate);
            update(clock.getDelta());
            labelRenderer.render(scene, camera.threeCamera);
            renderer.render(scene, camera.threeCamera);
        }

        function update(delta: number): void {
            // update TWEEN before controls! jaggy rotation
            // @ts-ignore
            TWEEN.update();
            skybox.update(delta);
            controls.threeControls.update();
            routeManager.update(delta, camera.threeCamera);
        }
    }
}

const loadContainer = document.createElement("div");
loadContainer.id = "loadcontainer";
document.body.appendChild(loadContainer);
const preloader = new Preloader(loadContainer);
new Texture(preloader.manager).load().then((textureObject) => {
    new App(textureObject);
});
