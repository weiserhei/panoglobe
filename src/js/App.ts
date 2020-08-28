import "./../css/style.css";
import "./../scss/main.scss";

import {
    Scene,
    Color,
    FogExp2,
    Clock,
    CatmullRomCurve3,
    MeshLambertMaterial,
    ImageLoader,
} from "three";
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
import SFC from "./classes/splineFollowCamera";
import { getHeightData } from "./utils/panoutils";

// import Impact from "./classes/impact";

// todo
// clipping plane for depthTest:false borders

import Config from "../data/config";

if (!WEBGL.isWebGLAvailable()) {
    const warning = WEBGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
    throw new Error(warning.innerHTML);
}
import T_heightmap from "../textures/heightmap_1440.jpg";

class App {
    private sfc: SFC;
    constructor(textures: object, heightData: Promise<Array<Array<Number>>>) {
        const container = document.createElement("div");
        container.className = "position-relative";
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
        labelRenderer.setSize(container.clientWidth, container.clientHeight);
        // labelRenderer.domElement.style.position = "absolute";
        // labelRenderer.domElement.style.top = "60px"; //navbar top height
        labelRenderer.domElement.style.top = "00px"; //navbar top height
        labelRenderer.domElement.className = "position-absolute";
        container.appendChild(labelRenderer.domElement);
        /*global process*/
        /*eslint no-undef: "error"*/
        if (process.env.NODE_ENV === "development") {
            const gui = new dat.GUI({ autoPlace: false, closed: true });
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
            // labelRenderer.setSize(window.innerWidth, window.innerHeight);
            // labelRenderer.setSize(
            //     container.offsetWidth,
            //     container.offsetHeight
            // );
            labelRenderer.setSize(
                // container.clientWidth,
                // container.clientHeight
                window.innerWidth,
                window.innerHeight
            );
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
            controls,
            heightData
        );

        const routes: Array<Route> = [];

        Config.routes.urls.forEach((url) => {
            RouteManager.load(url).then((x: RouteData) => {
                const route = routeManager.buildRoute(x, -0.2, folder);
                route.then((route) => {
                    routes.push(route);
                    // const poi: Array<any> = [];
                    // route.routeData.forEach(function (e: Poi, index: number) {
                    //     if (e.adresse) {
                    //         // poi.push(e.displacedPos);
                    //         poi.push(e.pos);
                    //     }
                    //     // poi.push(e.pos);
                    // });
                    // poi.push(route.routeData[route.routeData.length - 1].pos);
                    // const poiRoute = new CatmullRomCurve3(poi);
                    // this.sfc = new SFC(scene, undefined, route, poiRoute);
                });
            });
        });

        // RouteManager.load(Config.routes.urls.pop()).then((x: RouteData) => {
        //     const route = routeManager.buildRoute(x, -0.2, folder);
        //     route.then((route) => {
        //         routes.push(route);
        //         // new Impact(globus, route);
        //         // route.showLabels = false;

        //         const poi: Array<any> = [];
        //         route.routeData.forEach(function (e: Poi, index: number) {
        //             if (e.adresse) {
        //                 // poi.push(e.displacedPos);
        //                 poi.push(e.pos);
        //             }
        //             // poi.push(e.pos);
        //         });
        //         poi.push(route.routeData[route.routeData.length - 1].pos);
        //         const poiRoute = new CatmullRomCurve3(poi);
        //         this.sfc = new SFC(scene, undefined, route, poiRoute);
        //     });
        // });

        if (process.env.NODE_ENV === "development") {
            var obj = {
                add: function () {
                    RouteManager.load(Config.routes.urls[0]).then(
                        (x: RouteData) => {
                            const route = routeManager.buildRoute(x, 5, folder);
                            route.then((route: Route) => {
                                // route.showLabels = false;
                                folder.remove(button);
                                routes.push(route);

                                const x = {};
                                x[routes[0].name] = routes[0].name;
                                x[route.name] = route.name;

                                folder
                                    .add(x, route.name, x)
                                    .name("Route select")
                                    .onChange((x) => {
                                        const selection = routes.find(
                                            (r) => r.name === x
                                        );
                                        routeManager.activeRoute = selection;
                                    });
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
            const button = folder.add(obj, "add").name("Add Route Asien");
            const temp = camera.threeCamera;

            folder
                .add({ visible: false }, "visible")
                .name("Spline Follow Camera")
                .onChange((value: boolean) => {
                    if (value) {
                        camera.threeCamera = this.sfc.splineCamera;
                    } else {
                        camera.threeCamera = temp;
                    }
                });

            folder
                .add({ visible: false }, "visible")
                .name("Spline Visible")
                .onChange((value: boolean) => {
                    (this.sfc.mesh
                        .material as MeshLambertMaterial).visible = value;
                });
        }

        globus.setTextures(textures);
        // skybox.setTexture(texture.textures.uvtest);
        skybox.setTexture(textures["stars"]);

        const self = this;
        animate();
        function animate(): void {
            requestAnimationFrame(animate);
            update(clock.getDelta());
            // if (self.sfc) {
            if (self.sfc) self.sfc.render();
            // camera.threeCamera = self.sfc.splineCamera;
            // }
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
    const heightData = new Promise((resolve) => {
        return new ImageLoader().load(T_heightmap, resolve);
    }).then((image: CanvasImageSource) => {
        return getHeightData(image, 20);
    });
    new App(textureObject, heightData);
});
