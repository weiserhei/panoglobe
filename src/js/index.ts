import "./../css/style.css";
import "./../scss/main.scss";

import { WEBGL } from "three/examples/jsm/WebGL.js";
import { ImageLoader } from "three";
import init from "./init";
import Preloader from "./classes/preloader";
import { getHeightData } from "./utils/panoutils";

import T_heightmap from "../textures/heightmap_1440.jpg";

if (WEBGL.isWebGLAvailable()) {
    // preload, then init
    const loadContainer = document.createElement("div");
    loadContainer.id = "loadcontainer";
    document.body.appendChild(loadContainer);
    const preloader = new Preloader(loadContainer);

    // Preload Demo
    const imageLoader = new ImageLoader(preloader.manager);
    const loadHeightData = (url) =>
        new Promise((resolve) => imageLoader.load(url, resolve));
    loadHeightData(T_heightmap).then((heightImage) => {
        const scale = 20;
        const heightData = getHeightData(heightImage, scale);

        init(preloader, heightData);
    });
    // .catch(() => {console.warn("Error loading height data image")});
} else {
    const warning = WEBGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
}
